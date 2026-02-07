import {
  MovieCard,
  MoviesGridSkeleton,
  PaginationControls,
} from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

const PAGE_SIZE = 50;

async function LastYearGrid({ currentPage }: { currentPage: number }) {
  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setMonth(now.getMonth() - 1);
  const lastYear = new Date(now);
  lastYear.setFullYear(now.getFullYear() - 1);

  const movies = await prisma.movie.findMany({
    where: { releaseDate: { gte: lastYear, lt: lastMonth } },
    orderBy: { releaseDate: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  if (movies.length === 0) {
    return (
      <div className="text-center text-neutral-500 dark:text-neutral-400 py-12">
        No releases in the last year.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </div>
  );
}

async function PaginationWrapper({ currentPage }: { currentPage: number }) {
  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setMonth(now.getMonth() - 1);
  const lastYear = new Date(now);
  lastYear.setFullYear(now.getFullYear() - 1);

  const totalCount = await prisma.movie.count({
    where: { releaseDate: { gte: lastYear, lt: lastMonth } },
  });
  const hasNextPage = currentPage * PAGE_SIZE < totalCount;
  const hasPrevPage = currentPage > 1;

  return (
    <PaginationControls
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
      totalCount={totalCount}
      pageSize={PAGE_SIZE}
      basePath="/collections/new/last-year"
    />
  );
}

export default function LastYearPage({
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
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-pink-400">
            New Releases: Last Year
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Movies released in the past year.
          </p>
        </header>
        <Suspense fallback={<MoviesGridSkeleton count={PAGE_SIZE} />}>
          <LastYearGrid currentPage={currentPage} />
        </Suspense>
        <Suspense>
          <PaginationWrapper currentPage={currentPage} />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
