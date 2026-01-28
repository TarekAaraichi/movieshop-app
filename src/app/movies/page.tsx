/**
 * Movies listing (ensured)
 * Server-rendered page that lists movies with filtering and pagination.
 */

// src/app/movies/page.tsx
import { prisma } from "@/lib";
import type { Prisma } from "@prisma/client";
import { MovieSearch, MovieCard } from "@/components";
import PaginationControls from "@/components/PaginationControls";

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

  // Genre filtering temporarily disabled; remove genre query to avoid unnecessary work.

  return (
    <div>
      <main className="flex-grow px-2 sm:px-4 max-w-7xl mx-auto w-full pt-8 pb-12 box-border">
        <header className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-400 text-center">
            Movies
          </h1>
          <p className="mt-2 text-center text-sm text-gray-300">
            Showing {movies.length} of {totalCount}{" "}
            {totalCount === 1 ? "movie" : "movies"}.
          </p>
        </header>

        {/* Search and filter controls */}
        <section className="mb-8">
          {/* Simplified: remove outer background/border so only the search field has a single frame */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1 min-w-[240px]">
              <label className="sr-only" htmlFor="movie-search">
                Search movies
              </label>

              {/* search wrapper with inline icon for a modern, compact look */}
              <div className="relative w-full max-w-xl mx-auto rounded-md bg-[#071022]/60 border border-gray-600 focus-within:ring-2 focus-within:ring-indigo-400 transition flex items-center gap-2 px-2">
                <span className="absolute auto-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-4 h-4"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M21 21l-4.35-4.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="11"
                      cy="11"
                      r="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <br />
                <MovieSearch
                  initialQuery={query}
                  selectedGenre={selectedGenre}
                />
              </div>
            </div>

            {/* optional genre select (kept commented out) */}
            {/* <div className="w-full md:w-64">
              <GenreSelect
                selectedGenre={selectedGenre}
                query={query}
                options={genreOptions}
              />
            </div> */}
          </div>
        </section>
        {/* Inline Tailwind-only styles applied through classes below. */}
        {/* Movies grid */}
        <div className="min-h-[240px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie as any} />
          ))}

          {movies.length === 0 && (
            <div className="col-span-full p-8 rounded-lg bg-gray-800 border border-gray-700 text-center">
              <p className="text-gray-300">
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
        />
      </main>
    </div>
  );
}
