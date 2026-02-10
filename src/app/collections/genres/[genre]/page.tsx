import prisma from "@/lib/prisma";
import {
  MovieCard,
  MoviesGridSkeleton,
  PaginationControls,
} from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";
import { Suspense } from "react";

const PAGE_SIZE = 20;

type Props = {
  params: { genre: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

async function GenreGrid({
  genre,
  currentPage,
}: {
  genre: string;
  currentPage: number;
}) {
  const movies = await prisma.movie.findMany({
    where: {
      genres: { some: { genre: { name: genre } } },
      isArchived: false,
    },
    orderBy: { releaseDate: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  if (movies.length === 0) {
    return (
      <div className="text-center text-neutral-500 dark:text-neutral-400 py-12">
        No movies found for this genre.
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

async function PaginationWrapper({
  genre,
  currentPage,
}: {
  genre: string;
  currentPage: number;
}) {
  const totalCount = await prisma.movie.count({
    where: {
      genres: { some: { genre: { name: genre } } },
      isArchived: false,
    },
  });
  const hasNextPage = currentPage * PAGE_SIZE < totalCount;
  const hasPrevPage = currentPage > 1;

  return (
    <PaginationControls
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
      totalCount={totalCount}
      pageSize={PAGE_SIZE}
      basePath={`/collections/genres/${genre}`}
    />
  );
}

export default function GenrePage({ params, searchParams }: Props) {
  const { genre } = params;
  const page = searchParams["page"] ?? "1";
  const currentPage = Number(page);

  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-sky-400">
            {genre.charAt(0).toUpperCase() + genre.slice(1)} Movies
          </h1>
          <p className="mt-3 text-lg text-muted">
            Explore all {genre.charAt(0).toUpperCase() + genre.slice(1)} movies
            in our collection.
          </p>
        </header>
        <Suspense fallback={<MoviesGridSkeleton count={PAGE_SIZE} />}>
          <GenreGrid genre={genre} currentPage={currentPage} />
        </Suspense>
        <Suspense>
          <PaginationWrapper genre={genre} currentPage={currentPage} />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
