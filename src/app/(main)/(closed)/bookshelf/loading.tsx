import BookCardSkeleton from "@/components/BookCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  const renderShelfSkeleton = (title: string, count: number) => (
    <section key={title} className="animate-pulse">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-border/60">
        <Skeleton className="h-6 w-40" /> {/* Title */}
        <Skeleton className="h-8 w-24" /> {/* View All Button */}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
        {Array.from({ length: count }).map((_, index) => (
          <BookCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="container mx-auto px-4 py-10 md:py-12">
      <div className="flex justify-between items-center mb-12 md:mb-16">
        <Skeleton className="h-8 w-48" /> {/* Main Title */}
        <Skeleton className="h-6 w-20" /> {/* Syncing Indicator */}
      </div>

      <div className="space-y-16">
        {renderShelfSkeleton("Favorites", 5)}
        {renderShelfSkeleton("Currently Reading", 5)}
        {renderShelfSkeleton("Want to Read", 5)}
      </div>
    </div>
  );
}
