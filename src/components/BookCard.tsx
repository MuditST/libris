import Image from "next/image";
import { BookIcon, Heart } from "lucide-react";
import { BookItem } from "@/lib/types";
import { useBookshelfStore } from "@/store/bookshelfStore";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: BookItem;
  onClick?: (book: BookItem) => void;
  hideCategoryBadge?: boolean;
}

export default function BookCard({
  book,
  onClick,
  hideCategoryBadge = false,
}: BookCardProps) {
  const { isOnShelf, isFavorite } = useBookshelfStore();
  const currentShelf =
    book._shelf !== undefined ? book._shelf : isOnShelf(book.id);
  const favorite =
    book._favorite !== undefined ? book._favorite : isFavorite(book.id);

  const handleClick = () => {
    if (onClick) onClick(book);
  };

  // Variants should map correctly to theme colors
  const getShelfBadgeVariant = (
    shelf: string | null | undefined
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (shelf) {
      case "WILL_READ":
        return "secondary"; // Uses border color
      case "READING":
        return "secondary"; // Uses secondary bg/fg
      case "HAVE_READ":
        return "secondary"; // Uses primary bg/fg
      default:
        return "secondary";
    }
  };

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

  return (
    <Card
      className={cn(
        "cursor-pointer overflow-hidden flex flex-col h-full group relative",
        "transition-all duration-200 ease-in-out border-border bg-card", // Ensure bg-card
        "hover:shadow-lg hover:border-primary/50" // Enhanced hover effect
      )}
      onClick={handleClick}
    >
      {/* Badges Container */}
      {!hideCategoryBadge && (
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
          {/* Shelf badge - Increase size and weight */}
          {currentShelf && (
            <Badge
              variant={getShelfBadgeVariant(currentShelf)}
              // Use text-xs, increase padding/height, use font-semibold
              className="text-xs rounded-md px-2 py-0.5 h-5 flex items-center text-secondary-foreground font-semibold"
            >
              {getShelfBadgeLabel(currentShelf)}
            </Badge>
          )}
          {/* Favorite icon badge */}
          {favorite && (
            <Badge
              variant="destructive"
              // Keep this small
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
        {" "}
        {/* Adjusted padding and bg */}
        {book.volumeInfo.imageLinks?.thumbnail ? (
          <Image
            src={book.volumeInfo.imageLinks.thumbnail.replace(
              "http:",
              "https:"
            )}
            className="object-contain transition-transform duration-300 ease-in-out  p-3" // Added scale on hover
            alt={book.volumeInfo.title}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            {" "}
            {/* Adjusted bg */}
            <BookIcon size={48} className="text-muted-foreground/70" />{" "}
            {/* Adjusted color */}
          </div>
        )}
      </CardContent>

      {/* Title and Author */}
      <CardFooter className="pt-2 pb-3 px-3 flex-grow flex flex-col items-center justify-center text-center">
        {" "}
        {/* Adjusted padding */}
        {/* Title - Use Merriweather (default sans) */}
        <h3 className="line-clamp-2 font-sans text-md font-medium text-foreground group-hover:text-primary transition-colors">
          {" "}
          {/* Use foreground, hover primary */}
          {book.volumeInfo.title}
        </h3>
        {/* Author - Use Roboto Mono */}
        {book.volumeInfo.authors && (
          <p className="text-xs font-mono text-muted-foreground mt-0.5 line-clamp-1">
            {book.volumeInfo.authors.join(", ")}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
