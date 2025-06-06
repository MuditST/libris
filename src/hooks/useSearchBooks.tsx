"use client";

import { useState, useEffect, useRef } from "react";
import { searchBooksServer } from "@/actions/publicActions";
import { BookItem } from "@/lib/types";

// Create a cache for search results
const searchResultsCache: {
  [key: string]: {
    timestamp: number;
    data: any;
  };
} = {};

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

interface UseSearchBooksResult {
  books: BookItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  refetch: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  query: string;
}

export function useSearchBooks(
  initialQuery: string = ""
): UseSearchBooksResult {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const maxResults = 10; // Number of books to fetch per request

  // Keep track of the latest query we're fetching
  const latestQueryRef = useRef(initialQuery);

  // Update state when initialQuery changes
  useEffect(() => {
    // Only proceed if we have a new query
    if (initialQuery !== latestQueryRef.current) {
      latestQueryRef.current = initialQuery;
      setQuery(initialQuery);

      // If query is not empty, fetch books
      if (initialQuery.trim()) {
        setBooks([]);
        setStartIndex(0);
        fetchBooks(true, initialQuery.trim());
      } else {
        // Clear results when query is empty
        setBooks([]);
        setHasMore(false);
        setError(null);
      }
    }
  }, [initialQuery]);

  const fetchBooks = async (reset: boolean = true, searchQuery?: string) => {
    const queryToSearch = searchQuery !== undefined ? searchQuery : query;

    if (!queryToSearch.trim()) {
      setBooks([]);
      setLoading(false);
      setLoadingMore(false);
      setError(null);
      return;
    }

    // Create cache key from search params
    const cacheKey = `${queryToSearch.trim()}-${
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

      // Only update if this is the current query we care about
      if (queryToSearch !== latestQueryRef.current) {
        return;
      }

      // Check if we have a valid cached result
      const now = Date.now();
      if (
        searchResultsCache[cacheKey] &&
        now - searchResultsCache[cacheKey].timestamp < CACHE_DURATION
      ) {
        const cachedData = searchResultsCache[cacheKey].data;

        if (reset) {
          setBooks(cachedData.items || []);
        } else {
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

      const data = await searchBooksServer(
        queryToSearch,
        reset ? 0 : startIndex,
        maxResults,
        reset
      );

      // Only update state and cache if this is still the query we care about
      if (queryToSearch === latestQueryRef.current) {
        // Cache the response
        searchResultsCache[cacheKey] = {
          timestamp: now,
          data,
        };

        if (reset) {
          setBooks(data.items || []);
        } else {
          // Filter out any duplicate books
          const existingIds = new Set(books.map((book) => book.id));
          const newBooks = (data.items || []).filter(
            (book: BookItem) => !existingIds.has(book.id)
          );

          setBooks((prev) => [...prev, ...newBooks]);
        }

        setHasMore(data.hasMore || false);

        if (!reset) {
          setStartIndex((prev) => prev + maxResults);
        } else {
          setStartIndex(maxResults);
        }
      }
    } catch (err) {
      if (queryToSearch === latestQueryRef.current) {
        setError("Failed to search books. Please try again.");
      }
    } finally {
      if (queryToSearch === latestQueryRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    await fetchBooks(false);
  };

  return {
    books,
    loading,
    loadingMore,
    error,
    refetch: fetchBooks,
    loadMore,
    hasMore,
    query,
  };
}
