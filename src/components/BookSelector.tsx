"use client";

import { useState, useEffect } from "react";
import { useBookshelfStore } from "@/store/bookshelfStore";
import { useBookBlendStore } from "@/store/bookblendStore";
import { BookItem } from "@/lib/types";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type UsedShelfKeys = "WILL_READ" | "READING" | "HAVE_READ" | "FAVORITES";

interface BookSelectorProps {
  onBookSelect?: (book: BookItem) => void;
  showSelectionCount?: boolean;
  maxSelections?: number;
  headerText: string;
}

export default function BookSelector({
  onBookSelect,
  showSelectionCount = true,
  maxSelections = 5,
  headerText, // Prop remains but won't be used for the main header
}: BookSelectorProps) {
  const { wantToRead, reading, finished, favorites } = useBookshelfStore();
  const {
    selectedBooks,
    selectBook,
    unselectBook,
    clearSelectedBooks,
    recommendations,
  } = useBookBlendStore();
  const [filter, setFilter] = useState<"all" | UsedShelfKeys>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  useEffect(() => {
    if (!recommendations || recommendations.length === 0) {
      // Nothing to do - we'll keep the selected books
    }
  }, [recommendations]);

  const books: Record<UsedShelfKeys, BookItem[]> = {
    WILL_READ: wantToRead || [],
    READING: reading || [],
    HAVE_READ: finished || [],
    FAVORITES: favorites || [],
  };

  const bookMap = new Map<string, BookItem>();
  Object.entries(books)
    .filter(([key]) => key !== "FAVORITES")
    .forEach(([_, shelfBooks]) => {
      if (shelfBooks && Array.isArray(shelfBooks)) {
        shelfBooks.forEach((book) => {
          if (!bookMap.has(book.id)) {
            bookMap.set(book.id, book);
          }
        });
      }
    });
  const allBooks = Array.from(bookMap.values());

  const filteredBooks =
    filter === "all" ? allBooks : books[filter as UsedShelfKeys] || [];

  const totalBooks = filteredBooks.length;
  const totalPages = Math.ceil(totalBooks / booksPerPage) || 1;
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) setCurrentPage(pageNum);
  };

  const handleFilterChange = (newFilter: "all" | UsedShelfKeys) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const isSelected = (bookId: string) => {
    return selectedBooks.some((book) => book.id === bookId);
  };

  const handleBookClick = (book: BookItem) => {
    if (onBookSelect) {
      onBookSelect(book);
      return;
    }
    if (isSelected(book.id)) {
      unselectBook(book.id);
    } else if (selectedBooks.length < maxSelections) {
      selectBook(book);
    }
  };

  const handleClearSelections = () => {
    clearSelectedBooks();
  };

  return (
    <div className="w-full mb-8">
      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-1 mb-6 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFilterChange("all")}
          className={cn(
            "whitespace-nowrap rounded-none font-sans text-xs uppercase tracking-wider h-9 px-3",
            filter === "all"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          All Books
        </Button>
        {(Object.keys(books) as UsedShelfKeys[]).map((id) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange(id)}
            className={cn(
              "whitespace-nowrap rounded-none font-sans text-xs uppercase tracking-wider h-9 px-3",
              filter === id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {id === "WILL_READ"
              ? "Want to Read"
              : id === "HAVE_READ"
              ? "Finished"
              : id.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Book Count and Pagination Info */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-sans text-muted-foreground">
          {totalBooks} Books
        </span>
        {totalPages > 1 && (
          <span className="text-sm font-sans text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {currentBooks.map((book: BookItem) => (
          <div key={book.id} className="relative group/selector">
            <BookCard
              book={book}
              onClick={() => handleBookClick(book)}
              hideCategoryBadge={true}
            />
            {!onBookSelect && (
              <div
                onClick={() => handleBookClick(book)}
                className={cn(
                  "absolute inset-0 transition-all duration-150 cursor-pointer flex items-center justify-center",
                  isSelected(book.id)
                    ? "bg-primary/80 opacity-100"
                    : "opacity-0 group-hover/selector:opacity-100 group-hover/selector:bg-foreground/50",
                  selectedBooks.length >= maxSelections && !isSelected(book.id)
                    ? "bg-muted/80 opacity-100 cursor-not-allowed"
                    : ""
                )}
              >
                {isSelected(book.id) && (
                  <div className="absolute top-2 right-2 bg-background rounded-full p-1 shadow-md">
                    <Check size={16} className="text-primary" />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-md mt-6">
          <p className="font-sans text-muted-foreground">
            {filter === "all"
              ? "No books found in your shelves"
              : "No books found in this shelf"}
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else {
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
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
