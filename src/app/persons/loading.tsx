import { PersonsGridSkeleton } from "@/components/PersonsGridSkeleton";
import { PaginationControlsSkeleton } from "@/components/PaginationControlsSkeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-48 bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
      </div>
      <PaginationControlsSkeleton />
      <PersonsGridSkeleton count={20} />
      <PaginationControlsSkeleton />
    </div>
  );
}
