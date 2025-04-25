import { BookItem } from "@/lib/types";
import { cn } from "@/lib/utils"; // Make sure cn is imported
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { BookIcon, Heart } from "lucide-react";
import { useBookshelfStore } from "@/store/bookshelfStore";
import { Badge } from "@/components/ui/badge";

// Helper function for shelf labels (keep it or import if moved)
const getShelfBadgeLabel = (shelf: string | null | undefined): string => {
  switch (shelf) {
    case "WILL_READ":
      return "Want";
    case "READING":
      return "Reading";
    case "HAVE_READ":
      return "Finished";
    default:
      return "";
  }
};

interface BookCardProps {
  book: BookItem;
  onClick?: (book: BookItem) => void;
  hideCategoryBadge?: boolean;
  className?: string; // <-- Add className prop here
}

export default function BookCard({
  book,
  onClick,
  hideCategoryBadge = false,
  className, // <-- Destructure className here
}: BookCardProps) {
  const { isOnShelf, isFavorite } = useBookshelfStore();
  const currentShelf =
    book._shelf !== undefined ? book._shelf : isOnShelf(book.id);
  const favorite =
    book._favorite !== undefined ? book._favorite : isFavorite(book.id);

  const handleClick = () => {
    if (onClick) onClick(book);
  };

  return (
    <Card
      className={cn(
        // <-- Use cn() to merge classes
        "cursor-pointer overflow-hidden flex flex-col h-full group relative",
        "transition-all duration-200 ease-in-out border-border bg-card",
        "hover:shadow-lg hover:border-primary/50",
        className // <-- Apply the passed className
      )}
      onClick={handleClick}
    >
      {/* Badges Container */}
      {!hideCategoryBadge && (
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
          {/* Shelf badge */}
          {currentShelf && (
            <Badge
              variant="secondary"
              className="text-xs rounded-md px-2 py-0.5 h-5 flex items-center text-secondary-foreground font-semibold"
            >
              {getShelfBadgeLabel(currentShelf)}
            </Badge>
          )}
          {/* Favorite icon badge */}
          {favorite && (
            <Badge
              variant="destructive"
              className="rounded-sm w-5 h-5 p-0 flex items-center justify-center"
            >
              <Heart
                size={10}
                className="fill-current text-destructive-foreground"
              />
            </Badge>
          )}
        </div>
      )}

      {/* Image */}
      <CardContent className=" aspect-[4/5] flex items-center justify-center relative overflow-hidden bg-muted/30">
        {book.volumeInfo.imageLinks?.thumbnail ? (
          <Image
            src={book.volumeInfo.imageLinks.thumbnail.replace(
              "http:",
              "https:"
            )}
            className="object-contain transition-transform duration-300 ease-in-out p-3"
            alt={book.volumeInfo.title}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <BookIcon size={48} className="text-muted-foreground/70" />
          </div>
        )}
      </CardContent>

      {/* Title and Author */}
      <CardFooter className="pt-2 pb-3 px-3 flex-grow flex flex-col items-center justify-center text-center">
        {/* Title */}
        <h3 className="line-clamp-2 font-sans text-md font-medium text-foreground group-hover:text-primary transition-colors">
          {book.volumeInfo.title}
        </h3>
        {/* Author */}
        {book.volumeInfo.authors && (
          <p className="text-xs font-mono text-muted-foreground mt-0.5 line-clamp-1">
            {book.volumeInfo.authors.join(", ")}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
