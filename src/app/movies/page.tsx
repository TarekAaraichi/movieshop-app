/**
 * Movies listing (ensured)
 * Server-rendered page that lists movies with filtering and pagination.
 */

// src/app/movies/page.tsx
import { prisma } from "@/lib";
import type { Prisma, Movie } from "@prisma/client";
import { MovieSearch, MovieCard, AutoSubmitSelect } from "@/components";
import PaginationControls from "@/components/PaginationControls";
import { PageWrapper } from "@/components/PageThemeContext";

interface MoviesPageProps {
  searchParams: {
    q?: string;
    genre?: string;
    page?: string;
    per_page?: string;
  };
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  // `searchParams` is a potentially async wrapper in Next.js — await it before use
  const sp = (await searchParams) as {
    q?: string;
    genre?: string;
    page?: string;
    per_page?: string;
  };
  const query = sp.q ?? "";
  const selectedGenre = sp.genre ?? "";
  const page = Number(sp.page ?? "1");
  const perPage = Number(sp.per_page ?? "10");

  const skip = (page - 1) * perPage;

  // Fetch movies, optionally filtering by title or people (actor/director)
  // Build `where` dynamically so we only include filters when present
  const where: Prisma.MovieWhereInput = {};
  if (query) {
    Object.assign(where, {
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          people: {
            some: {
              person: {
                fullName: { contains: query, mode: "insensitive" },
              },
            },
          },
        },
      ],
    });
  }
  if (selectedGenre) {
    Object.assign(where, {
      genres: {
        some: {
          genre: {
            name: selectedGenre,
          },
        },
      },
    });
  }

  // exclude archived movies from public listing
  Object.assign(where, { isArchived: false });

  const totalCount = await prisma.movie.count({ where });

  const movies = await prisma.movie.findMany({
    where,
    orderBy: { releaseDate: "desc" },
    take: perPage,
    skip,
    include: {
      people: {
        include: { person: true },
      },
      genres: {
        include: { genre: true },
      },
    },
  });

  const hasNextPage = skip + perPage < totalCount;
  const hasPrevPage = skip > 0;

  // Fetch all genres for filter options
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  const genreOptions = genres.map((g) => ({ value: g.name, label: g.name }));

  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
            Movies
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Showing {movies.length} of {totalCount} movies.
          </p>
        </header>

        <form className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <MovieSearch />
          <div className="w-full md:w-auto">
            <AutoSubmitSelect
              name="genre"
              value={selectedGenre}
              ariaLabel="Filter by genre"
              options={genreOptions}
              className="w-full"
            />
          </div>
        </form>

        <div className="min-h-[240px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie as Movie} />
          ))}

          {movies.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-500 dark:text-neutral-400">
                No movies found matching your filters.
              </p>
            </div>
          )}
        </div>

        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalCount={totalCount}
          pageSize={perPage}
          basePath="/movies"
        />
      </div>
    </PageWrapper>
  );
}
