import { Card } from "./ui/card";

export function PersonCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-2/3 bg-popover animate-pulse" />
      <div className="p-3">
        <div className="h-5 w-3/4 bg-popover animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-popover animate-pulse rounded mt-2" />
      </div>
    </Card>
  );
}
