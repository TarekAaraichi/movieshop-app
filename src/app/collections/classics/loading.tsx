import { MoviesGridSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

export default function ClassicsLoading() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <div className="h-12 w-1/2 mx-auto rounded-lg bg-neutral-700 animate-pulse"></div>
          <div className="h-5 w-3/4 mx-auto mt-3 rounded-lg bg-neutral-700 animate-pulse"></div>
        </header>
        <MoviesGridSkeleton count={10} />
        <div className="mt-8 flex justify-center">
          <div className="h-10 w-48 rounded-lg bg-neutral-800 animate-pulse"></div>
        </div>
      </div>
    </PageWrapper>
  );
}
