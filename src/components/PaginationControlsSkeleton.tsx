export function PaginationControlsSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 mt-8 animate-pulse">
      <div className="h-10 w-24 bg-neutral-700 rounded-md"></div>
      <div className="flex gap-2">
        <div className="h-10 w-10 bg-neutral-700 rounded-md"></div>
        <div className="h-10 w-10 bg-neutral-700 rounded-md"></div>
        <div className="h-10 w-10 bg-neutral-700 rounded-md"></div>
      </div>
      <div className="h-10 w-24 bg-neutral-700 rounded-md"></div>
    </div>
  );
}
