import { PageWrapper } from "@/components/PageThemeContext";
import { PaginationControlsSkeleton } from "@/components/PaginationControlsSkeleton";

const OrderItemSkeleton = () => (
  <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md animate-pulse">
    <div className="p-4 border-b border-border flex justify-between items-center">
      <div>
        <div className="h-6 w-32 bg-popover rounded"></div>
        <div className="h-4 w-24 bg-popover rounded mt-2"></div>
      </div>
      <div className="text-right">
        <div className="h-6 w-20 bg-popover rounded"></div>
        <div className="h-5 w-16 bg-popover rounded mt-2"></div>
      </div>
    </div>
    <div className="p-4">
      <ul className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <li key={i} className="flex items-center gap-4">
            <div className="w-10 h-14 bg-popover rounded-md"></div>
            <div className="flex-1">
              <div className="h-5 w-3/4 bg-popover rounded"></div>
              <div className="h-4 w-1/4 bg-popover rounded mt-2"></div>
            </div>
            <div className="h-5 w-16 bg-popover rounded"></div>
            <div className="h-4 w-10 bg-popover rounded ml-2"></div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default function ProfileOrdersLoading() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="h-10 w-1/2 bg-popover rounded-lg animate-pulse"></div>
          <div className="h-4 w-1/3 bg-popover rounded mt-3 animate-pulse"></div>
        </header>

        {/* Year filter skeleton */}
        <div className="mb-6 flex justify-end">
          <div className="h-10 w-32 bg-popover rounded-md animate-pulse"></div>
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <OrderItemSkeleton key={i} />
          ))}
        </div>

        {/* Pagination controls skeleton */}
        <PaginationControlsSkeleton />
      </div>
    </PageWrapper>
  );
}
