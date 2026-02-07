/**
 * Top-rated collection page
 * Lists top-rated movies.
 */

import { MovieCard, MoviesGridSkeleton } from "@/components";
import PaginationControls from "@/components/PaginationControls";
import { PageWrapper } from "@/components/PageThemeContext";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

const PAGE_SIZE = 30;

async function TopRatedGrid({ currentPage }: { currentPage: number }) {
  const movies = await prisma.movie.findMany({
    where: { rating: { not: 0 } },
    orderBy: [
      { rating: "desc" },
      { voteCount: "desc" },
      { releaseDate: "desc" },
    ],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  if (movies.length === 0) {
    return (
      <div className="text-center text-neutral-500 dark:text-neutral-400 py-12">
        No top-rated movies found.
      </div>
    );
  }

  return (
    <div className="min-h-30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </div>
  );
}

async function PaginationWrapper({ currentPage }: { currentPage: number }) {
  const totalCount = await prisma.movie.count({
    where: { rating: { not: 0 } },
  });
  const hasNextPage = currentPage * PAGE_SIZE < totalCount;
  const hasPrevPage = currentPage > 1;

  return (
    <PaginationControls
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
      totalCount={totalCount}
      pageSize={PAGE_SIZE}
      basePath="/collections/top-rated"
    />
  );
}

export default function TopRatedPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams["page"] ?? "1";
  const currentPage = Number(page);

  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-pink-400">
            Top Rated
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Discover the highest-rated movies as voted by our community.
          </p>
        </header>
        <Suspense fallback={<MoviesGridSkeleton count={PAGE_SIZE} />}>
          <TopRatedGrid currentPage={currentPage} />
        </Suspense>
        <Suspense>
          <PaginationWrapper currentPage={currentPage} />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
