import { MoviesGridSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

const PAGE_SIZE = 30;

export default function TopRatedLoading() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <div className="h-12 w-1/2 mx-auto rounded-lg bg-neutral-700 animate-pulse"></div>
          <div className="h-5 w-3/4 mx-auto mt-3 rounded-lg bg-neutral-700 animate-pulse"></div>
        </header>
        <MoviesGridSkeleton count={PAGE_SIZE} />
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-10 w-24 rounded-md bg-neutral-700 animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-md bg-neutral-700 animate-pulse"></div>
            <div className="h-10 w-10 rounded-md bg-neutral-800 animate-pulse"></div>
            <div className="h-10 w-10 rounded-md bg-neutral-700 animate-pulse"></div>
          </div>
          <div className="h-10 w-24 rounded-md bg-neutral-700 animate-pulse"></div>
        </div>
      </div>
    </PageWrapper>
  );
}
