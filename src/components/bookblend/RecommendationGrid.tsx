"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useBookBlendStore } from "@/store/bookblendStore";
import { useBookshelfStore } from "@/store/bookshelfStore";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import { AnimatePresence } from "framer-motion";
import { BookItem } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function RecommendationGrid() {
  const { recommendations, isLoading, error } = useBookBlendStore();
  const {
    bookshelfMap,
    favoritesMap,
    loading: bookshelfLoading,
  } = useBookshelfStore();

  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const router = useRouter();
  const originalPath = useRef("/bookblend");

  const handleBookClick = useCallback((book: BookItem) => {
    setSelectedBook(book);
    window.history.pushState(null, "", `/book/${book.id}`);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (useBookshelfStore.getState().loading) {
      console.log("Bookshelf store is loading, preventing modal close.");
      return;
    }

    setSelectedBook(null);
    window.history.pushState(null, "", "/bookblend");
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

  return (
    <div className="w-full">
      <h2 className="font-sans text-lg mb-8 uppercase tracking-wide text-foreground">
        Recommendations
      </h2>

      <div className="space-y-10">
        {recommendations.map(
          (book: BookItem & { reason?: string }, index: number) => {
            const safeBook = {
              ...book,
              volumeInfo: {
                ...book.volumeInfo,
                description: book.volumeInfo?.description || "",
                authors: book.volumeInfo?.authors || ["Unknown"],
              },
            };

            return (
              <div
                key={book.id || `rec-${index}`}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center p-4 border rounded-lg bg-card shadow-sm"
              >
                {/* Column 1: Book Card */}
                <div className="md:col-span-1">
                  <BookCard
                    book={safeBook}
                    onClick={() => handleBookClick(safeBook)}
                    hideCategoryBadge={false}
                  />
                </div>

                {/* Column 2: Reason */}
                <div className="md:col-span-3 pt-2 md:pt-0">
                  <h3 className="font-sans font-semibold text-foreground mb-2">
                    Why you might like this?
                  </h3>
                  <p className="text-sm md:px-0 font-sans text-muted-foreground italic leading-relaxed">
                    "{book.reason || "Based on your selections"}"
                  </p>
                </div>
              </div>
            );
          }
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
}
