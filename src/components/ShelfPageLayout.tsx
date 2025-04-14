"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBookshelfStore } from "@/store/bookshelfStore";
import { BookItem } from "@/lib/types";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ShelfConfig = {
  title: string;
  shelfKey: "wantToRead" | "reading" | "finished" | "favorites";
  apiCategory: "WILL_READ" | "READING" | "HAVE_READ" | "FAVORITES";
  emptyStateMessage: string;
  returnPath: string;
};

interface ShelfPageLayoutProps {
  config: ShelfConfig;
}

export default function ShelfPageLayout({ config }: ShelfPageLayoutProps) {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 15;

  const {
    [config.shelfKey]: books = [],
    totalCounts,
    error: storeError,
    isInitialized,
    lastUpdated,
    refreshBookshelves,
    loading: storeLoading,
  } = useBookshelfStore();

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      try {
        const isStale =
          !lastUpdated || Date.now() - lastUpdated > 30 * 60 * 1000;
        if (!isInitialized || isStale) {
          await refreshBookshelves();
        }
      } catch (error) {
        console.error("Error loading books:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, [isInitialized, lastUpdated, refreshBookshelves]);

  const totalBooks = totalCounts?.[config.shelfKey] || books?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalBooks / booksPerPage));
  const startIdx = (currentPage - 1) * booksPerPage;
  const visibleBooks = books?.slice(startIdx, startIdx + booksPerPage) || [];

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const handleBookClick = useCallback((book: BookItem) => {
    setSelectedBook(book);
    window.history.pushState(null, "", `/book/${book.id}`);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (useBookshelfStore.getState().loading) return;
    setSelectedBook(null);
    window.history.pushState(null, "", config.returnPath);
  }, [config.returnPath]);

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.includes("/book/")) {
        if (!useBookshelfStore.getState().loading) {
          setSelectedBook(null);
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const maxAllowedPage = Math.max(1, Math.ceil(totalBooks / booksPerPage));
    if (currentPage > maxAllowedPage) {
      setCurrentPage(maxAllowedPage);
      window.scrollTo(0, 0);
    }
  }, [totalBooks, booksPerPage, currentPage]);

  if (storeError) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full border-destructive bg-destructive/10">
          <CardContent className="p-6 text-center">
            <p className="mb-4 text-destructive font-sans">{storeError}</p>
            <Button
              variant="destructive"
              onClick={() => router.push("/discover")}
            >
              Discover Books
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isInitialized && (isLoading || storeLoading)) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <LoadingIndicator text={`Loading ${config.title}...`} />
      </div>
    );
  }

  if (totalBooks === 0 && isInitialized) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center font-sans">
              {config.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-8 font-sans">
              {config.emptyStateMessage}
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
              <Button
                variant="default"
                onClick={() => router.push("/discover")}
              >
                Discover Books
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/bookshelf")}
              >
                View Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-sans uppercase tracking-tight text-foreground">
          {config.title}
        </h1>
        <div className="flex items-center">
          {(isLoading || storeLoading) && (
            <LoadingIndicator
              text="Syncing"
              className="text-sm text-muted-foreground"
            />
          )}
          <span className="text-sm font-sans text-muted-foreground ml-3">
            {totalBooks} Books
          </span>
        </div>
      </div>

      <div className="flex space-x-4 mb-8">
        <Button
          variant="link"
          asChild
          className="text-sm font-sans uppercase p-0 h-auto"
        >
          <Link href="/bookshelf">← Back to Library</Link>
        </Button>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {visibleBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => handleBookClick(book)}
            hideCategoryBadge={true}
          />
        ))}
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else {
              const start = Math.max(
                1,
                Math.min(currentPage - 2, totalPages - 4)
              );
              pageNum = start + i;
            }
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "ghost"}
                size="icon"
                onClick={() => goToPage(pageNum)}
                className="w-9 h-9"
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
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
}
