"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, BookIcon, Heart, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

import { BookItem } from "@/lib/types";
import { SHELF_IDS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useBookshelfStore } from "@/store/bookshelfStore";

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type BookshelfCategory = keyof typeof SHELF_IDS;

interface BookModalProps {
  book: BookItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookModal({ book, isOpen, onClose }: BookModalProps) {
  const {
    isOnShelf,
    addToBookshelf,
    removeFromBookshelf,
    toggleFavorite,
    isFavorite,
    error: storeError,
  } = useBookshelfStore();

  const [localState, setLocalState] = useState({
    currentShelf: null as BookshelfCategory | null,
    isFavorite: false,
  });

  const [actionStates, setActionStates] = useState({
    favoriteLoading: false,
    removeLoading: false,
    willReadLoading: false,
    readingLoading: false,
    finishedLoading: false,
  });

  const isAnyActionLoading = Object.values(actionStates).some(Boolean);
  const originalPath = useRef(window.location.pathname);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const currentShelfValue = isOnShelf(book.id) as BookshelfCategory | null;
      const isFavoriteValue = isFavorite(book.id);
      setLocalState({
        currentShelf: currentShelfValue,
        isFavorite: isFavoriteValue,
      });
    }
  }, [isOpen, book.id, isOnShelf, isFavorite]);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = useBookshelfStore.subscribe(() => {
      const currentShelfValue = isOnShelf(book.id) as BookshelfCategory | null;
      const isFavoriteValue = isFavorite(book.id);
      setLocalState((prev) => ({
        ...prev,
        currentShelf: currentShelfValue,
        isFavorite: isFavoriteValue,
      }));
    });
    return () => unsubscribe();
  }, [isOpen, book.id, isOnShelf, isFavorite]);

  useEffect(() => {
    if (storeError) {
      toast.error(storeError);
    }
  }, [storeError]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const handleAddToShelf = async (shelf: BookshelfCategory) => {
    let loadingKey: keyof typeof actionStates;
    switch (shelf) {
      case "WILL_READ":
        loadingKey = "willReadLoading";
        break;
      case "READING":
        loadingKey = "readingLoading";
        break;
      case "HAVE_READ":
        loadingKey = "finishedLoading";
        break;
      default:
        return;
    }

    if (isAnyActionLoading) return;

    try {
      setActionStates((p) => ({ ...p, [loadingKey]: true }));
      const toastId = toast.loading(
        `Adding to ${getCategoryDisplayName(shelf)}...`
      );
      setLocalState((p) => ({ ...p, currentShelf: shelf }));
      await addToBookshelf(book.id, shelf, { bookData: book });
      toast.success(`Added to ${getCategoryDisplayName(shelf)}`, {
        id: toastId,
      });
    } catch (err) {
      console.error("Error adding to shelf:", err);
      setLocalState((p) => ({
        ...p,
        currentShelf: isOnShelf(book.id) as BookshelfCategory | null,
      }));
      toast.error("Failed to update shelf");
    } finally {
      setActionStates((p) => ({ ...p, [loadingKey]: false }));
    }
  };

  const handleToggleFavorite = async () => {
    if (isAnyActionLoading) return;
    try {
      setActionStates((p) => ({ ...p, favoriteLoading: true }));
      const isCurrentlyFavorite = localState.isFavorite;
      setLocalState((p) => ({ ...p, isFavorite: !isCurrentlyFavorite }));
      const toastId = toast.loading(
        isCurrentlyFavorite
          ? "Removing from favorites..."
          : "Adding to favorites..."
      );
      await toggleFavorite(book.id, { bookData: book });
      toast.success(
        isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites",
        { id: toastId }
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setLocalState((p) => ({ ...p, isFavorite: !p.isFavorite }));
      toast.error("Failed to update favorites");
    } finally {
      setActionStates((p) => ({ ...p, favoriteLoading: false }));
    }
  };

  const handleRemoveFromShelf = async () => {
    if (isAnyActionLoading || !localState.currentShelf) return;

    try {
      setActionStates((p) => ({ ...p, removeLoading: true }));
      const toastId = toast.loading("Removing from bookshelf...");
      setLocalState((p) => ({ ...p, currentShelf: null }));
      await removeFromBookshelf(book.id);
      toast.success("Removed from bookshelf", { id: toastId });
    } catch (err) {
      console.error("Error removing from shelf:", err);
      setLocalState((p) => ({
        ...p,
        currentShelf: isOnShelf(book.id) as BookshelfCategory | null,
      }));
      toast.error("Failed to remove from shelf");
    } finally {
      setActionStates((p) => ({ ...p, removeLoading: false }));
    }
  };

  const getCategoryDisplayName = (category: BookshelfCategory): string => {
    switch (category) {
      case "WILL_READ":
        return "Want to Read";
      case "READING":
        return "Reading";
      case "HAVE_READ":
        return "Finished";
      case "FAVORITES":
        return "Favorites";
      default:
        return category;
    }
  };

  if (!isOpen) return null;

  const hasDescription = !!book.volumeInfo.description;
  const descriptionId = React.useId();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 md:p-12",
          "translate-x-0 translate-y-0",
          "data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100",
          "data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0",
          "data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0",
          "w-auto max-w-none border-none bg-transparent p-0 shadow-none"
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-describedby={hasDescription ? descriptionId : undefined}
      >
        <DialogTitle className="sr-only">{book.volumeInfo.title}</DialogTitle>
        {hasDescription && (
          <DialogDescription id={descriptionId} className="sr-only">
            {book.volumeInfo.description?.replace(/<[^>]*>?/gm, "") ||
              "Book details"}
          </DialogDescription>
        )}

        <div className="relative grid w-full max-w-6xl h-full max-h-[90vh] grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden rounded-lg border bg-card shadow-xl">
          <DialogClose
            className="absolute top-3 right-4 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </DialogClose>

          <div className="relative flex flex-col items-center justify-center border-b md:border-b-0 md:border-r p-6 sm:p-8 bg-muted/30">
            <div className="relative aspect-[2/3] w-full max-w-[180px] sm:max-w-[220px] rounded overflow-hidden shadow-md bg-muted mb-4">
              {book.volumeInfo.imageLinks?.thumbnail ? (
                <Image
                  src={book.volumeInfo.imageLinks.thumbnail.replace(
                    "http:",
                    "https:"
                  )}
                  alt={book.volumeInfo.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookIcon size={48} className="text-muted-foreground/70" />
                </div>
              )}
            </div>
            <div className="text-center md:hidden mt-2">
              <h2 className="text-lg font-semibold font-sans line-clamp-2">
                {book.volumeInfo.title}
              </h2>
              {book.volumeInfo.authors && (
                <p className="text-sm text-muted-foreground font-mono line-clamp-1">
                  {book.volumeInfo.authors.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col overflow-hidden p-6 sm:p-8 md:pr-12 lg:pr-16">
            <div className="flex-shrink-0 pb-4 mb-4 md:border-b">
              <div className="flex justify-between items-start gap-4">
                <div className="hidden md:block">
                  <h2 className="text-xl font-semibold font-sans leading-tight">
                    {book.volumeInfo.title}
                  </h2>
                  {book.volumeInfo.authors && (
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {book.volumeInfo.authors.join(", ")}
                    </p>
                  )}
                </div>
                <Button
                  variant={localState.isFavorite ? "destructive" : "outline"}
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={isAnyActionLoading}
                  className="flex-shrink-0"
                  aria-label={
                    localState.isFavorite ? "Remove favorite" : "Add favorite"
                  }
                >
                  {actionStates.favoriteLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        localState.isFavorite && "fill-current"
                      )}
                    />
                  )}
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-grow min-h-0 mb-6 pr-3 -mr-3">
              <h3 className="text-sm font-semibold font-sans uppercase tracking-wide text-muted-foreground mb-2">
                Description
              </h3>
              {hasDescription ? (
                <div
                  className="text-sm text-foreground/90 leading-relaxed font-sans prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: book.volumeInfo.description || "",
                  }}
                />
              ) : (
                <p className="text-sm text-muted-foreground italic font-sans">
                  No description available.
                </p>
              )}
            </ScrollArea>

            <div className="flex-shrink-0 pt-6 md:border-t space-y-3">
              <div className="flex flex-wrap gap-2">
                {(
                  ["WILL_READ", "READING", "HAVE_READ"] as Extract<
                    BookshelfCategory,
                    "WILL_READ" | "READING" | "HAVE_READ"
                  >[]
                ).map((shelf) => {
                  const isLoading =
                    actionStates[
                      `${shelf.toLowerCase()}Loading` as keyof typeof actionStates
                    ];
                  const isActive = localState.currentShelf === shelf;
                  return (
                    <Button
                      key={shelf}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAddToShelf(shelf)}
                      disabled={isAnyActionLoading}
                      className="flex-1 min-w-[100px]"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        getCategoryDisplayName(shelf)
                      )}
                    </Button>
                  );
                })}
              </div>
              {localState.currentShelf && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFromShelf}
                  disabled={isAnyActionLoading}
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {actionStates.removeLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={14} className="mr-2" /> Remove from Shelf
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
