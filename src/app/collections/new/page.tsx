/**
 * New releases collection page
 * Lists recently added movies.
 */

import prisma from "@/lib/prisma";
import { MovieCard, MoviesGridSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

async function getRecentMovies() {
  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setMonth(now.getMonth() - 1);
  const lastYear = new Date(now);
  lastYear.setFullYear(now.getFullYear() - 1);

  const recent = await prisma.movie.findMany({
    where: { releaseDate: { gte: lastMonth } },
    orderBy: { releaseDate: "desc" },
    take: 20,
  });
  const year = await prisma.movie.findMany({
    where: { releaseDate: { gte: lastYear, lt: lastMonth } },
    orderBy: { releaseDate: "desc" },
    take: 50,
  });
  return { recent, year };
}

import { Suspense } from "react";

async function NewReleasesGrid() {
  const { recent, year } = await getRecentMovies();
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4 text-center">Last Month</h2>
        {recent.length === 0 ? (
          <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
            No releases in the last month.
          </div>
        ) : (
          <div className="min-h-30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {recent.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-4 text-center text-black dark:text-white">
          Last Year
        </h2>
        {year.length === 0 ? (
          <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
            No releases in the last year.
          </div>
        ) : (
          <div className="min-h-30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {year.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function NewReleasesPage() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-pink-400">
            New Releases
          </h1>
        </header>
        <Suspense fallback={<MoviesGridSkeleton count={10} />}>
          <NewReleasesGrid />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
