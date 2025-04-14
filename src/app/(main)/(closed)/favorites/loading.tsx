import BookCardSkeleton from "@/components/BookCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-48" /> {/* Title */}
        <div className="flex items-center">
          <Skeleton className="h-6 w-20" /> {/* Syncing Indicator */}
          <Skeleton className="h-5 w-24 ml-3" /> {/* Book Count */}
        </div>
      </div>

      {/* Back Link Skeleton */}
      <div className="flex space-x-4 mb-8">
        <Skeleton className="h-5 w-32" /> {/* Back to Library */}
      </div>

      {/* Book Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
        {/* Adjust length based on booksPerPage in ShelfPageLayout (currently 15) */}
        {Array.from({ length: 15 }).map((_, index) => (
          <BookCardSkeleton key={index} />
        ))}
      </div>

      {/* Pagination Controls Skeleton */}
      <div className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2">
        <Skeleton className="h-9 w-24" /> {/* Previous */}
        <Skeleton className="h-9 w-9 rounded-md" /> {/* Page Number */}
        <Skeleton className="h-9 w-9 rounded-md" /> {/* Page Number */}
        <Skeleton className="h-9 w-9 rounded-md" /> {/* Page Number */}
        <Skeleton className="h-9 w-24" /> {/* Next */}
      </div>
    </div>
  );
}
