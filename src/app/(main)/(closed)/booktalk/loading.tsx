import BookCardSkeleton from "@/components/BookCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-28 mb-2" /> {/* Title */}
        <Skeleton className="h-4 w-96" /> {/* Description */}
      </div>

      {/* BookSelector Skeleton */}
      <div className="w-full mb-12">
        {/* Filter Tabs Skeleton */}
        <div className="flex overflow-x-auto gap-1 mb-6 border-b border-border">
          <Skeleton className="h-9 w-24 mr-1" />
          <Skeleton className="h-9 w-24 mr-1" />
          <Skeleton className="h-9 w-24 mr-1" />
          <Skeleton className="h-9 w-24 mr-1" />
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Book Count/Pagination Info Skeleton */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Book Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))}
        </div>

        {/* Pagination Controls Skeleton */}
        <div className="mt-12 flex justify-center items-center space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}
