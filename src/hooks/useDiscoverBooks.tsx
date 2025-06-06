"use client";

import { useState, useEffect } from "react";
import { BookItem } from "@/lib/types";
import { discoverCache, CACHE_DURATION } from "@/lib/cacheUtils";
import {
  discoverBooks,
  SubjectFilter,
  OrderFilter,
  PrintTypeFilter,
} from "@/actions/publicActions"; // Import both function and types
import { useBookshelfStore } from "@/store/bookshelfStore";

// The rest of your component would use these imported types
interface UseDiscoverBooksResult {
  books: BookItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  // Update refetch to include printType
  refetch: (
    reset?: boolean,
    newSubject?: SubjectFilter,
    newOrderBy?: OrderFilter,
    newPrintType?: PrintTypeFilter
  ) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  subject: SubjectFilter;
  orderBy: OrderFilter;
  printType: PrintTypeFilter;
  setSubject: (subject: SubjectFilter) => void;
  setOrderBy: (orderBy: OrderFilter) => void;
  setPrintType: (printType: PrintTypeFilter) => void;
}

export function useDiscoverBooks(
  initialSubject: SubjectFilter = "fiction",
  initialOrderBy: OrderFilter = "relevance",
  initialPrintType: PrintTypeFilter = "all"
): UseDiscoverBooksResult {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [subject, setSubject] = useState<SubjectFilter>(initialSubject);
  const [orderBy, setOrderBy] = useState<OrderFilter>(initialOrderBy);
  const [printType, setPrintType] = useState<PrintTypeFilter>(initialPrintType);
  const maxResults = 10; // Number of books to fetch per request

  const fetchBooks = async (
    reset: boolean = true,
    newSubject?: SubjectFilter,
    newOrderBy?: OrderFilter,
    newPrintType?: PrintTypeFilter
  ) => {
    const currentSubject = newSubject !== undefined ? newSubject : subject;
    const currentOrderBy = newOrderBy !== undefined ? newOrderBy : orderBy;
    const currentPrintType =
      newPrintType !== undefined ? newPrintType : printType;

    // Create a cache key from all parameters
    const cacheKey = `${currentSubject}-${currentOrderBy}-${currentPrintType}-${
      reset ? 0 : startIndex
    }-${maxResults}`;

    try {
      if (reset) {
        setLoading(true);
        setStartIndex(0);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      // Check if we have a valid cached result
      const now = Date.now();
      if (
        discoverCache[cacheKey] &&
        now - discoverCache[cacheKey].timestamp < CACHE_DURATION
      ) {
        const cachedData = discoverCache[cacheKey].data;

        if (reset) {
          setBooks(cachedData.items || []);
        } else {
          // Filter out duplicates when appending to existing books
          const existingIds = new Set(books.map((book) => book.id));
          const newBooks = (cachedData.items || []).filter(
            (book: BookItem) => !existingIds.has(book.id)
          );

          setBooks((prev) => [...prev, ...newBooks]);
        }

        setHasMore(cachedData.hasMore || false);

        if (!reset) {
          setStartIndex((prev) => prev + maxResults);
        } else {
          setStartIndex(maxResults);
        }

        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // If no valid cache, make the API call
      const data = await discoverBooks(
        reset ? 0 : startIndex,
        maxResults,
        currentSubject,
        currentOrderBy,
        currentPrintType
      );

      // Cache the response
      discoverCache[cacheKey] = {
        timestamp: now,
        data,
      };

      if (reset) {
        setBooks(data.items || []);
      } else {
        // Filter out any duplicate books that might be returned
        const existingIds = new Set(books.map((book) => book.id));
        const newBooks = (data.items || []).filter(
          (book: BookItem) => !existingIds.has(book.id)
        );

        setBooks((prev) => [...prev, ...newBooks]);
      }

      // Check if there are more books to load
      setHasMore(data.hasMore || false);

      // Update startIndex for the next fetch
      if (!reset) {
        setStartIndex((prev) => prev + maxResults);
      } else {
        setStartIndex(maxResults);
      }
    } catch (err) {
      setError(
        reset
          ? "Failed to load books. Please try again later."
          : "Failed to load more books. Please try again."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    await fetchBooks(false);
  };

  // When subject, order, or printType changes, automatically refetch
  useEffect(() => {
    // Only fetch if we've initialized (avoids double fetching on mount)
    if (!loading) {
      fetchBooks(true);
    }
  }, [subject, orderBy, printType]);

  // Initial fetch on mount
  useEffect(() => {
    fetchBooks(true);
  }, []);

  // These functions now just update the state, which triggers the useEffect
  const handleSubjectChange = (newSubject: SubjectFilter) => {
    if (newSubject !== subject) {
      setSubject(newSubject);
    }
  };

  const handleOrderByChange = (newOrderBy: OrderFilter) => {
    if (newOrderBy !== orderBy) {
      setOrderBy(newOrderBy);
    }
  };

  const handlePrintTypeChange = (newPrintType: PrintTypeFilter) => {
    if (newPrintType !== printType) {
      setPrintType(newPrintType);
    }
  };

  // Update useDiscoverBooks.tsx - Fix the book updating logic
  useEffect(() => {
    const unsubscribe = useBookshelfStore.subscribe((state) => {
      // This runs whenever bookshelf state changes
      setBooks((currentBooks) => {
        // Skip if no books
        if (!currentBooks || currentBooks.length === 0) return currentBooks;

        // Create a completely new array with updated shelf info
        const updatedBooks = currentBooks.map((book) => {
          const shelf = state.bookshelfMap[book.id];
          const isFavorite = state.favoritesMap[book.id];

          // Create a new book object with updated metadata
          return {
            ...book,
            _shelf: shelf,
            _favorite: isFavorite,
          };
        });

        // Force re-render by returning a new array - important!
        return [...updatedBooks];
      });
    });

    return () => unsubscribe();
  }, []); // Empty dependency array - only run once on mount

  return {
    books,
    loading,
    loadingMore,
    error,
    refetch: fetchBooks,
    loadMore,
    hasMore,
    subject,
    orderBy,
    printType,
    setSubject: handleSubjectChange,
    setOrderBy: handleOrderByChange,
    setPrintType: handlePrintTypeChange,
  };
}
