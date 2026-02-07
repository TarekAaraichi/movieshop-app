/**
 * New releases collection page
 * Lists recently added movies.
 */

import { MovieCarousel, MoviesGridSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

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
    include: { genres: { include: { genre: true } } },
  });
  const year = await prisma.movie.findMany({
    where: { releaseDate: { gte: lastYear, lt: lastMonth } },
    orderBy: { releaseDate: "desc" },
    take: 50,
    include: { genres: { include: { genre: true } } },
  });
  return { recent, year };
}

async function NewReleasesCarousels() {
  const { recent, year } = await getRecentMovies();

  return (
    <div className="space-y-12">
      <MovieCarousel
        title="Last Month"
        movies={recent.map((movie) => ({
          ...movie,
          price: Number(movie.price),
        }))}
        viewMoreHref="/collections/new/last-month"
      />
      <MovieCarousel
        title="Last Year"
        movies={year.map((movie) => ({ ...movie, price: Number(movie.price) }))}
        viewMoreHref="/collections/new/last-year"
      />
    </div>
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
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            The latest and greatest movies, just for you.
          </p>
        </header>
        <Suspense fallback={<MoviesGridSkeleton count={10} />}>
          <NewReleasesCarousels />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
