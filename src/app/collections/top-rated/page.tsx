/**
 * Top-rated collection page
 * Lists top-rated movies.
 */

import { prisma } from "@/lib/prisma";
import { MovieCard, MoviesGridSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

import { Suspense } from "react";

async function TopRatedGrid() {
  const movies = await prisma.movie.findMany({
    where: { rating: { not: 0 } },
    orderBy: [
      { rating: "desc" },
      { voteCount: "desc" },
      { releaseDate: "desc" },
    ],
    take: 30,
  });
  if (movies.length === 0) {
    return (
      <div className="text-center text-neutral-500 dark:text-neutral-400 py-12">
        No top-rated movies found.
      </div>
    );
  }
  return (
    <div className="min-h-[120px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </div>
  );
}

export default function TopRatedPage() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
            Top Rated
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Discover the highest-rated movies as voted by our community.
          </p>
        </header>
        <Suspense fallback={<MoviesGridSkeleton count={10} />}>
          <TopRatedGrid />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
