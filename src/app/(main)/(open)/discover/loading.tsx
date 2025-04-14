import BookCardSkeleton from "@/components/BookCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 animate-pulse">
      {/* Skeleton for Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 space-y-2">
          <Skeleton className="h-4 w-16" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>
        <div className="w-full md:w-1/3 space-y-2">
          <Skeleton className="h-4 w-16" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>
        <div className="w-full md:w-1/3 space-y-2">
          <Skeleton className="h-4 w-16" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>
      </div>

      {/* Skeleton for Book Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10">
        {Array.from({ length: 10 }).map((_, index) => (
          <BookCardSkeleton key={index} />
        ))}
      </div>

      {/* Skeleton for Load More Button */}
      <div className="flex justify-center mt-12 mb-8">
        <Skeleton className="h-11 w-32" />
      </div>
    </div>
  );
}
