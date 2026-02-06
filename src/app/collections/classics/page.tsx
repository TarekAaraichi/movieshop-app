/**
 * All-time classics collection
 * Lists oldest movies by release date
 */

import prisma from "@/lib/prisma";
import type { Prisma, Movie } from "@prisma/client";
import { MovieCard, MoviesGridSkeleton } from "@/components";
import PaginationControls from "@/components/PaginationControls";
import { PageWrapper } from "@/components/PageThemeContext";

interface Props {
  searchParams?: { page?: string; per_page?: string };
}

import { Suspense } from "react";

async function ClassicsGrid({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) {
  const skip = (page - 1) * perPage;
  const where: Prisma.MovieWhereInput = { isArchived: false };
  const totalCount = await prisma.movie.count({ where });
  const movies = await prisma.movie.findMany({
    where,
    orderBy: { releaseDate: "asc" },
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
    <>
      <div className="min-h-60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie as Movie} />
        ))}
        {movies.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">
              No classics found.
            </p>
          </div>
        )}
      </div>
      <PaginationControls
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        totalCount={totalCount}
        pageSize={perPage}
        basePath="/collections/classics"
      />
    </>
  );
}

export default function ClassicsPage({ searchParams }: Props) {
  const sp = searchParams ?? {};
  const page = Number(sp.page ?? "1");
  const perPage = Number(sp.per_page ?? "10");
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500">
            All-Time Classics
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Older films worth revisiting.
          </p>
        </header>
        <Suspense fallback={<MoviesGridSkeleton count={10} />}>
          <ClassicsGrid page={page} perPage={perPage} />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
