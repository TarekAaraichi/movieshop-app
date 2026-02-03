/**
 * Budget friendly collection
 * Lists movies ordered by price ascending
 */

import { prisma } from "@/lib/prisma";
import type { Prisma, Movie } from "@prisma/client";
import { MovieCard } from "@/components";
import PaginationControls from "@/components/PaginationControls";
import { PageWrapper } from "@/components/PageThemeContext";

interface Props {
  searchParams?: { page?: string; per_page?: string };
}

export default async function BudgetPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const page = Number(sp.page ?? "1");
  const perPage = Number(sp.per_page ?? "10");
  const skip = (page - 1) * perPage;

  const where: Prisma.MovieWhereInput = { isArchived: false };
  const totalCount = await prisma.movie.count({ where });
  const movies = await prisma.movie.findMany({
    where,
    orderBy: { price: "asc" },
    take: perPage,
    skip,
    include: {
      genres: { include: { genre: true } },
      people: { include: { person: true } },
    },
  });
  const hasNextPage = skip + perPage < totalCount;
  const hasPrevPage = skip > 0;

  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
            Budget Friendly
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Great movies that won't break the bank. Showing {movies.length} of{" "}
            {totalCount} movies.
          </p>
        </header>

        <div className="min-h-[240px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie as Movie} />
          ))}

          {movies.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-500 dark:text-neutral-400">
                No budget movies found.
              </p>
            </div>
          )}
        </div>

        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalCount={totalCount}
          pageSize={perPage}
          basePath="/collections/budget"
        />
      </div>
    </PageWrapper>
  );
}
