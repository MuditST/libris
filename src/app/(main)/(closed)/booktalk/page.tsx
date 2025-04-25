"use client";

import React, { useState, useEffect } from "react";
import { useBookshelfStore } from "@/store/bookshelfStore";
import BookSelector from "@/components/BookSelector";
import ChatModal from "@/components/booktalk/ChatModal";
import { BookItem } from "@/lib/types";
import { BookOpen, Sparkles } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BookTalkPage() {
  const router = useRouter();
  const {
    favorites,
    wantToRead,
    reading,
    finished,
    isInitialized,
    refreshBookshelves,
    loading: storeLoading,
    lastUpdated,
  } = useBookshelfStore();

  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize books data
  useEffect(() => {
    if (hasInitialized) return;
    const isStale = !lastUpdated || Date.now() - lastUpdated > 30 * 60 * 1000;
    if (!isInitialized || isStale) {
      refreshBookshelves().finally(() => setHasInitialized(true));
    } else {
      setHasInitialized(true);
    }
  }, [isInitialized, lastUpdated, hasInitialized, refreshBookshelves]);

  const handleBookSelect = (book: BookItem) => setSelectedBook(book);
  const handleCloseModal = () => setSelectedBook(null);

  const hasBooks = Boolean(
    favorites?.length ||
      wantToRead?.length ||
      reading?.length ||
      finished?.length
  );

  // Loading state
  if (!hasInitialized || storeLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <LoadingIndicator text="Loading Your Books..." />
      </div>
    );
  }

  // Empty state
  if (!hasBooks && hasInitialized) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center font-sans flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Book Talk!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4 font-sans">
              No books found in your library.
            </p>
            <p className="text-muted-foreground mb-8 font-sans">
              Add books to your shelves to chat with the AI about them.
            </p>
            <Button variant="default" onClick={() => router.push("/discover")}>
              Discover Books
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-sans uppercase tracking-tight text-foreground">
          Book Talk!
        </h1>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Select a book from your shelves to start a conversation with AI.
        </p>
      </div>

      {/* Book selector */}
      <div className="mb-12">
        <BookSelector
          headerText="Select a Book to Chat About"
          onBookSelect={handleBookSelect}
          showSelectionCount={false}
          maxSelections={1}
        />
      </div>

      {/* Chat modal */}
      <AnimatePresence>
        {selectedBook && (
          <ChatModal
            book={selectedBook}
            isOpen={!!selectedBook}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
