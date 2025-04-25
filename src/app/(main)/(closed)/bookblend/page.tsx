"use client";

import React, { useState, useEffect } from "react";
import { useBookshelfStore } from "@/store/bookshelfStore";
import { useBookBlendStore } from "@/store/bookblendStore";
import { Sparkles, RefreshCw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookSelector from "@/components/BookSelector";
import RecommendationGrid from "@/components/bookblend/RecommendationGrid";
import LoadingIndicator from "@/components/LoadingIndicator";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function BookBlendPage() {
  const router = useRouter();
  const {
    wantToRead,
    reading,
    finished,
    favorites,
    isInitialized,
    lastUpdated,
    loading: isLoadingBooks,
    refreshBookshelves,
  } = useBookshelfStore();

  const {
    recommendations,
    selectedBooks,
    generateRecommendations,
    clearSelectedBooks,
    clearRecommendations,
    isLoading: isGenerating,
  } = useBookBlendStore();

  const [showSelection, setShowSelection] = useState(true);
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

  // Handle UI state changes
  useEffect(() => {
    if (isGenerating || (recommendations && recommendations.length > 0)) {
      setShowSelection(false);
    }
  }, [isGenerating, recommendations]);

  const handleGenerateClick = () => generateRecommendations();

  const handleNewBlendClick = () => {
    clearRecommendations();
    clearSelectedBooks();
    setShowSelection(true);
  };

  const hasBooks = Boolean(
    wantToRead?.length ||
      reading?.length ||
      finished?.length ||
      favorites?.length
  );

  // Empty state when no books are available
  if (!hasBooks && hasInitialized) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center font-sans flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              BookBlend
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4 font-sans">
              Your library is empty.
            </p>
            <p className="text-muted-foreground mb-8 font-sans">
              Add books to your shelves to use BookBlend.
            </p>
            <Button variant="default" onClick={() => router.push("/discover")}>
              Discover Books
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show the full-page loader if we haven't initialized yet AND books are loading.
  if (!hasInitialized && isLoadingBooks) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <LoadingIndicator text="Loading Your Books..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-sans uppercase tracking-tight text-foreground">
            Book Blend
          </h1>
          {showSelection && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
              Select up to 5 books from your shelves for custom recommendations.
            </p>
          )}
        </div>
        {/* Show syncing indicator if books are loading *after* initialization */}
        {isLoadingBooks && hasInitialized && (
          <LoadingIndicator
            text="Syncing"
            className="text-sm text-muted-foreground"
            size="small"
          />
        )}
      </div>

      {/* Selected books summary */}
      {selectedBooks.length > 0 && (
        <div className="mb-8 space-y-4 p-4 border rounded-lg bg-background">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-sm uppercase tracking-wide text-foreground">
              Selected ({selectedBooks.length}/5)
            </h3>
            {showSelection && (
              <Button
                onClick={handleGenerateClick}
                disabled={selectedBooks.length === 0 || isGenerating}
                size="sm"
              >
                <Sparkles size={16} className="mr-2" />
                <span>Generate Blend</span>
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedBooks.map((book) => (
              <div
                key={book.id}
                className="w-16 rounded overflow-hidden shadow-sm"
              >
                <div className="aspect-[2/3] relative bg-muted">
                  {book.volumeInfo?.imageLinks?.thumbnail ? (
                    <Image
                      src={book.volumeInfo.imageLinks.thumbnail.replace(
                        "http:",
                        "https:"
                      )}
                      alt={book.volumeInfo.title || "Book cover"}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={24} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book selection UI */}
      {showSelection && (
        <BookSelector
          headerText="Select Books for Your Blend"
          maxSelections={5}
          showSelectionCount={true}
        />
      )}

      {/* Generating Loading state */}
      {isGenerating && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-background">
          <div className="flex flex-col items-center justify-center">
            <LoadingIndicator text="Generating Your BookBlend" />
            <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto font-sans">
              Our AI is analyzing your selections to find perfect
              recommendations.
            </p>
          </div>
        </div>
      )}

      {/* New blend button */}
      {!showSelection && !isGenerating && recommendations?.length > 0 && (
        <div className="mb-8">
          <Button variant="outline" onClick={handleNewBlendClick}>
            <RefreshCw size={16} className="mr-2" />
            <span>Create New Blend</span>
          </Button>
        </div>
      )}

      {/* Recommendations grid */}
      {!isGenerating && recommendations?.length > 0 && <RecommendationGrid />}
    </div>
  );
}
