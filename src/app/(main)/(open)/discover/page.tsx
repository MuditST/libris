"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useDiscoverBooks } from "@/hooks/useDiscoverBooks";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import { BookItem } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SubjectFilter,
  OrderFilter,
  PrintTypeFilter,
} from "@/actions/publicActions";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DiscoverPage = () => {
  const {
    books,
    loading,
    loadMore,
    loadingMore,
    hasMore,
    error,
    subject,
    orderBy,
    printType,
    setSubject,
    setOrderBy,
    setPrintType,
  } = useDiscoverBooks();

  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  const handleBookClick = (book: BookItem) => {
    setSelectedBook(book);
    // Update URL without page reload
    window.history.pushState(null, "", `/book/${book.id}`);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedBook(null);
    // Restore URL
    window.history.pushState(null, "", "/discover");
  }, []);

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

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadMore();
    }
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value as SubjectFilter);
  };

  const handleOrderChange = (value: string) => {
    setOrderBy(value as OrderFilter);
  };

  const handlePrintTypeChange = (value: string) => {
    setPrintType(value as PrintTypeFilter);
  };

  if (loading && books.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingIndicator />
      </div>
    );
  }

  if (error && books.length === 0) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Filter controls - Updated to 3 columns for desktop */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <label className="block mb-2 text-sm uppercase">Subject</label>
          <Select value={subject} onValueChange={handleSubjectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fiction">Fiction</SelectItem>
              <SelectItem value="nonfiction">Non-Fiction</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="romance">Romance</SelectItem>
              <SelectItem value="thriller">Thriller</SelectItem>
              <SelectItem value="mystery">Mystery</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="biography">Biography</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="poetry">Poetry</SelectItem>
              <SelectItem value="comics">Comics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <label className="block mb-2 text-sm uppercase">Order By</label>
          <Select value={orderBy} onValueChange={handleOrderChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <label className="block mb-2 text-sm uppercase">Type</label>
          <Select value={printType} onValueChange={handlePrintTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="books">Books</SelectItem>
              <SelectItem value="magazines">Magazines</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Book Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onClick={handleBookClick} />
        ))}
      </div>
      {books.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books found</p>
        </div>
      )}

      {books.length === 0 && !loading && (
        <div className="text-center py-12">
          {printType === "magazines" ? (
            <div>
              <p className="text-gray-500">
                No magazines found for this subject.
              </p>
              <p className="text-gray-500 mt-2">
                Try selecting a different subject or type.
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No books found</p>
          )}
        </div>
      )}
      {books.length === 0 && !loading && (
        <div className="text-center py-12">
          {printType === "magazines" ? (
            <div>
              <p className="text-gray-500">
                No magazines found for this subject.
              </p>
              <p className="text-gray-500 mt-2">
                Try selecting a different subject or type.
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No books found</p>
          )}
        </div>
      )}
      {/* Load more button */}
      {books.length > 0 && (
        <div className="flex justify-center mt-12 mb-8">
          <Button
            variant="outline" // Use outline variant
            onClick={handleLoadMore}
            disabled={loadingMore || !hasMore}
            // Apply theme colors
            className={cn(
              "px-8 py-3 uppercase tracking-wide font-sans", // Use font-sans
              "border-primary text-primary", // Theme border/text
              "hover:bg-primary hover:text-primary-foreground", // Theme hover
              "disabled:opacity-50 disabled:cursor-not-allowed", // Disabled state
              loadingMore && "cursor-not-allowed" // Explicit loading cursor
            )}
          >
            {loadingMore ? (
              <LoadingIndicator text="Loading more" className="text-sm" />
            ) : hasMore ? (
              "Load More"
            ) : (
              "No More Books"
            )}
          </Button>
        </div>
      )}
      {/* Error message when loading more fails */}
      {error && books.length > 0 && (
        <div className="text-center text-red-600 mt-4">{error}</div>
      )}
      <AnimatePresence>
        {selectedBook && (
          <BookModal
            book={selectedBook}
            isOpen={!!selectedBook}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscoverPage;
