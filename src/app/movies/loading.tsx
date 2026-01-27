import { Skeleton } from "@/components/ui/skeleton";

function MovieCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[330px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-[240px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
