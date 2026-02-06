import { MoviesGridSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

export default function NewReleasesLoading() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <div className="h-12 w-1/2 mx-auto rounded-lg bg-neutral-700 animate-pulse"></div>
        </header>
        <div className="space-y-12">
          <div>
            <div className="h-8 w-1/4 mb-6 rounded-lg bg-neutral-700 animate-pulse"></div>
            <MoviesGridSkeleton count={5} />
          </div>
          <div>
            <div className="h-8 w-1/4 mb-6 rounded-lg bg-neutral-700 animate-pulse"></div>
            <MoviesGridSkeleton count={5} />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
