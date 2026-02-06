import { MoviesGridSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

export default function GenreLoading() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <div className="h-12 w-1/2 mx-auto rounded-lg bg-neutral-700 animate-pulse"></div>
        </header>
        <MoviesGridSkeleton count={10} />
      </div>
    </PageWrapper>
  );
}
