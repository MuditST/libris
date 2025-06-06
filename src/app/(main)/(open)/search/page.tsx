"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react"; // Import Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import { BookItem } from "@/lib/types";
import { useSearchBooks } from "@/hooks/useSearchBooks";
import LoadingIndicator from "@/components/LoadingIndicator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  const { books, loading, loadMore, loadingMore, hasMore, error } =
    useSearchBooks(debouncedQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery !== query.trim()) {
        
        setDebouncedQuery(query.trim());
        if (query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`, {
            scroll: false,
          });
        } else if (initialQuery) {
          router.push("/search", { scroll: false });
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, router, initialQuery, debouncedQuery]);

  const handleBookClick = (book: BookItem) => {
    setSelectedBook(book);
    window.history.pushState(null, "", `/book/${book.id}`);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedBook(null);
    const queryParam = query ? `?q=${encodeURIComponent(query)}` : "";
    window.history.pushState(null, "", `/search${queryParam}`);
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
    }, 0);
  }, [query]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedBook) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBook, handleCloseModal]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.includes("/book/")) {
        setSelectedBook(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadMore();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  return (
    <>
      {/* Search input */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setDebouncedQuery(query.trim());
                if (query.trim()) {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`, {
                    scroll: false,
                  });
                }
              }
            }}
            placeholder="Search books..."
            className={cn(
              "w-full px-4 py-3 pr-12 rounded-md",
              "font-mono text-base",
              "bg-background text-foreground",
              "border border-input",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary",
              "placeholder:text-muted-foreground"
            )}
            autoFocus
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mr-2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
            {loading ? (
              <Loader2 size={20} className="animate-spin text-gray-400" />
            ) : (
              <SearchIcon size={20} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      {debouncedQuery && books.length > 0 && (
        <div className="mb-6 text-center text-sm font-mono opacity-70">
          <p>
            {books.length} {books.length === 1 ? "result" : "results"} found
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && !loadingMore && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingIndicator text="Searching" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && debouncedQuery && books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No books found for &quot;{debouncedQuery}&quot;
          </p>{" "}
          {/* Escaped quotes */}
        </div>
      )}

      {/* Initial state */}
      {!loading && !debouncedQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500">Enter a search term to find books</p>
        </div>
      )}

      {/* Results grid */}
      {books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onClick={handleBookClick} />
          ))}
        </div>
      )}

      {/* Load more button */}
      {books.length > 0 && debouncedQuery && (
        <div className="flex justify-center mt-12 mb-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore || !hasMore}
            className={cn(
              "px-8 py-3 uppercase tracking-wide font-sans",
              "border-primary text-primary",
              "hover:bg-primary hover:text-primary-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              loadingMore && "cursor-not-allowed"
            )}
          >
            {loadingMore ? (
              <LoadingIndicator text="Loading more" className="text-sm" />
            ) : hasMore ? (
              "Load More"
            ) : (
              "No More Results"
            )}
          </Button>
        </div>
      )}

      {/* Book modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookModal
            book={selectedBook}
            isOpen={!!selectedBook}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </>
  );
}

const SearchPage = () => {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<LoadingIndicator text="Loading Search..." />}>
        <SearchContent />
      </Suspense>
    </div>
  );
};

export default SearchPage;
