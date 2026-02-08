import { Card } from "./card";

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-rose-100/10 to-transparent" />
);

const SkeletonCard = () => (
  <Card className="relative h-full overflow-hidden rounded-lg bg-white/5 p-4 shadow-sm">
    <div className="space-y-3">
      <div className="h-32 rounded-md bg-white/5" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-md bg-white/5" />
        <div className="h-4 w-1/2 rounded-md bg-white/5" />
      </div>
    </div>
    <Shimmer />
  </Card>
);

type GridSkeletonProps = {
  count?: number;
  className?: string;
};

export const GridSkeleton = ({
  count = 8,
  className = "",
}: GridSkeletonProps) => {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
