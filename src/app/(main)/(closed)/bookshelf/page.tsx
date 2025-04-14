"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBookshelfStore } from "@/store/bookshelfStore";
import { BookItem } from "@/lib/types";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ShelfSectionProps {
  title: string;
  books: BookItem[];
  onBookClick: (book: BookItem) => void;
  href: string;
}

const BookshelfPage = () => {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  const {
    favorites,
    wantToRead,
    reading,
    finished,
    loading: storeLoading,
    error: storeError,
    isInitialized,
    refreshBookshelves,
  } = useBookshelfStore();

  useEffect(() => {
    if (!isInitialized) {
      refreshBookshelves();
    }
  }, [refreshBookshelves, isInitialized]);

  const handleBookClick = useCallback((book: BookItem) => {
    setSelectedBook(book);
    window.history.pushState(null, "", `/book/${book.id}`);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedBook(null);
    window.history.pushState(null, "", "/bookshelf");
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.includes("/book/")) {
        setSelectedBook(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Error state using Card
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

  // Empty state using Card
  const isEmpty =
    (!favorites || favorites.length === 0) &&
    (!wantToRead || wantToRead.length === 0) &&
    (!reading || reading.length === 0) &&
    (!finished || finished.length === 0);

  if (isEmpty && isInitialized) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center font-sans">
              Your Library
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4 font-sans">
              Your library is empty.
            </p>
            <p className="text-muted-foreground mb-8 font-sans">
              Start by discovering books and adding them to your shelves.
            </p>
            <Button variant="default" onClick={() => router.push("/discover")}>
              Discover Books
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state for initial load
  if (!isInitialized && storeLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <LoadingIndicator text="Loading Library..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-12">
      <div className="flex justify-between items-center mb-12 md:mb-16">
        <h1 className="text-3xl font-sans uppercase   text-foreground">
          Your Library
        </h1>
        {storeLoading && (
          <div className="flex items-center">
            <LoadingIndicator
              text="Syncing"
              className="text-sm text-muted-foreground"
            />
          </div>
        )}
      </div>

      <div className="space-y-16">
        {favorites && favorites.length > 0 && (
          <ShelfSection
            title="Favorites"
            books={favorites}
            onBookClick={handleBookClick}
            href="/favorites"
          />
        )}
        {reading && reading.length > 0 && (
          <ShelfSection
            title="Currently Reading"
            books={reading}
            onBookClick={handleBookClick}
            href="/reading"
          />
        )}
        {wantToRead && wantToRead.length > 0 && (
          <ShelfSection
            title="Want to Read"
            books={wantToRead}
            onBookClick={handleBookClick}
            href="/willread"
          />
        )}
        {finished && finished.length > 0 && (
          <ShelfSection
            title="Finished"
            books={finished}
            onBookClick={handleBookClick}
            href="/finished"
          />
        )}
      </div>

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

const ShelfSection = ({
  title,
  books,
  onBookClick,
  href,
}: ShelfSectionProps) => {
  const displayBooks = books.slice(0, 5);
  const { loading, totalCounts } = useBookshelfStore();

  const getTotalCount = () => {
    const countFromStore =
      totalCounts?.[
        title === "Favorites"
          ? "favorites"
          : title === "Currently Reading"
          ? "reading"
          : title === "Want to Read"
          ? "wantToRead"
          : title === "Finished"
          ? "finished"
          : (undefined as never)
      ];
    return countFromStore !== undefined && countFromStore >= books.length
      ? countFromStore
      : books.length;
  };

  const totalCount = getTotalCount();
  const showViewAll = totalCount > displayBooks.length;

  return (
    <section>
      <div className="flex justify-between items-center mb-6 pb-3  border-border/60">
        <h2 className="text-xl font-sans uppercase  text-foreground tracking-tight">
          {title}
        </h2>
        <div className="flex items-center">
          {loading && <LoadingIndicator text="" className="text-sm mr-3" />}
          {showViewAll && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs font-sans uppercase tracking-wider border-primary/50 text-primary hover:bg-primary/10"
            >
              <Link href={href}>View All ({totalCount})</Link>
            </Button>
          )}
        </div>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {displayBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => onBookClick(book)}
            hideCategoryBadge={true}
          />
        ))}
      </motion.div>
    </section>
  );
};

export default BookshelfPage;
