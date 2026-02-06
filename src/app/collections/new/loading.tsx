import { MoviesGridSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

export default function NewReleasesLoading() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <div className="h-12 w-1/2 mx-auto rounded-lg bg-neutral-700 animate-pulse"></div>
        </header>
        <div className="mb-10">
          <div className="h-8 w-1/4 mx-auto mb-4 rounded-lg bg-neutral-700 animate-pulse"></div>
          <MoviesGridSkeleton count={5} />
        </div>
        <div>
          <div className="h-8 w-1/4 mx-auto mb-4 rounded-lg bg-neutral-700 animate-pulse"></div>
          <MoviesGridSkeleton count={10} />
        </div>
      </div>
    </PageWrapper>
  );
}
