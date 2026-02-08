import { PersonCardSkeleton } from "./PersonCardSkeleton";

export function PersonsGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PersonCardSkeleton key={i} />
      ))}
    </div>
  );
}
