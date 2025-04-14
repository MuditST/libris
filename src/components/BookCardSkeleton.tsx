import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function BookCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      {/* Image Skeleton */}
      <CardContent className="p-0 aspect-[4/5] flex items-center justify-center relative overflow-hidden bg-muted/30">
        <Skeleton className="h-full w-full" />
      </CardContent>

      {/* Title and Author Skeleton */}
      <CardFooter className="pt-2 pb-3 px-3 flex-grow flex flex-col items-center justify-center text-center">
        <Skeleton className="h-4 w-3/4 mb-1.5" /> {/* Title */}
        <Skeleton className="h-3 w-1/2" /> {/* Author */}
      </CardFooter>
    </Card>
  );
}