import { MoviesGridSkeleton, PaginationControlsSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

export default function ClassicsLoading() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative flex flex-col items-center">
          <div className="h-12 w-1/2 mb-4 rounded-lg bg-gray-200 dark:bg-neutral-700 animate-pulse"></div>
          <div className="h-6 w-3/4 rounded-lg bg-gray-200 dark:bg-neutral-700 animate-pulse"></div>
        </header>
        <MoviesGridSkeleton count={10} />
        <PaginationControlsSkeleton />
      </div>
    </PageWrapper>
  );
}
