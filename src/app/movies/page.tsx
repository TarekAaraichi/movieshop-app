/**
 * Movies listing (ensured)
 * Server-rendered page that lists movies with filtering and pagination.
 */

// src/app/movies/page.tsx
import { prisma } from "@/lib";
import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { AddToCartClientButton, MovieSearch } from "@/components";

interface MoviesPageProps {
  searchParams: {
    q?: string;
    genre?: string;
  };
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  // `searchParams` is a potentially async wrapper in Next.js — await it before use
  const sp = (await searchParams) as { q?: string; genre?: string };
  const query = sp.q ?? "";
  const selectedGenre = sp.genre ?? "";

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

  const movies = await prisma.movie.findMany({
    where,
    orderBy: { releaseDate: "desc" },
    include: {
      people: {
        include: { person: true },
      },
      genres: {
        include: { genre: true },
      },
    },
  });

  // Genre filtering temporarily disabled; remove genre query to avoid unnecessary work.

  return (
    <div>
      <main className="flex-grow px-2 sm:px-4 max-w-7xl mx-auto w-full pt-8 pb-12 box-border">
        <header className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-400 text-center">
            Movies
          </h1>
          <p className="mt-2 text-center text-sm text-gray-300">
            Browse the latest non-archived titles — showing {movies.length}{" "}
            {movies.length === 1 ? "movie" : "movies"}.
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
          {movies.map((movie) => {
            const director = movie.people.find((p) => p.role === "DIRECTOR");
            return (
              <article
                key={movie.id}
                className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/70 via-gray-800/50 to-gray-700/50 border border-white/6 shadow-lg transition-[transform,box-shadow,filter] duration-[220ms] ease-[cubic-bezier(.2,.9,.2,1)] will-change-[transform] hover:shadow-[0_20px_40px_rgba(2,6,23,0.6)] hover:-translate-y-2 hover:scale-105 hover:z-[50]"
                aria-labelledby={`movie-${movie.id}-title`}
              >
                <Link
                  href={`/movies/${movie.id}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                >
                  {/* Poster container using Tailwind aspect ratio utilities */}
                  <div className="relative w-full aspect-[2/3] min-h-[220px] max-h-[420px] bg-[#071022] overflow-hidden">
                    <Image
                      src={movie.imageUrl ?? "/file.svg"}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 20vw"
                      className="object-contain object-center w-full h-full transition-[transform,filter] duration-[300ms] ease-[cubic-bezier(.2,.9,.2,1)] group-hover:scale-[1.02] group-hover:brightness-[1.03]"
                    />

                    {/* Price badge pinned to top-right */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-300 to-blue-400 text-black text-sm font-semibold">
                        SEK{Number(movie.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h2
                      id={`movie-${movie.id}-title`}
                      className="text-base sm:text-lg font-semibold text-gray-100 hover:text-white hover:underline line-clamp-2"
                    >
                      {movie.title}
                    </h2>

                    <div className="mt-2 flex items-center justify-between text-sm text-gray-300">
                      <span>
                        {movie.releaseDate
                          ? new Date(
                              movie.releaseDate as unknown as string,
                            ).getFullYear()
                          : "—"}
                      </span>

                      {/* Inline genre badges (moved under release year) */}
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-2">
                          {movie.genres?.slice(0, 3).map((g) => (
                            <span
                              key={g.genre.name}
                              className="text-xs px-2 py-0.5 rounded-md backdrop-blur-sm bg-gradient-to-r from-white/40 to-slate-300/30 text-white/80 border border-white/10"
                            >
                              {g.genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Actor list and director moved outside the movie Link to avoid nested anchors */}
                <div className="p-4 pt-0">
                  <div className="mt-3 text-sm text-gray-300 flex flex-wrap gap-2">
                    {movie.people
                      .filter((p) => p.role === "ACTOR")
                      .slice(0, 2)
                      .map((p) => (
                        <Link
                          key={p.person.id}
                          href={`/persons/${p.person.id}`}
                          className="text-teal-300 hover:underline text-sm"
                        >
                          {p.person.fullName}
                        </Link>
                      ))}
                  </div>

                  {director && (
                    <div className="mt-3 text-sm text-gray-400">
                      <span className="text-xs text-gray-300">Director: </span>
                      <Link
                        href={`/persons/${director.person.id}`}
                        className="text-teal-400 hover:underline font-medium"
                      >
                        {director.person.fullName}
                      </Link>
                    </div>
                  )}

                  {/* Add to cart button (replaces prior View button) */}
                  <div className="mt-4">
                    <AddToCartClientButton
                      movieId={movie.id}
                      disabled={
                        Boolean(movie.isArchived) ||
                        (movie.stock != null ? movie.stock === 0 : false)
                      }
                      buttonClassName="rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white hover:from-emerald-600 hover:to-blue-600"
                    />
                  </div>
                </div>
              </article>
            );
          })}

          {movies.length === 0 && (
            <div className="col-span-full p-8 rounded-lg bg-white/3 border border-white/6 text-center">
              <p className="text-gray-300">
                No movies found matching your filters.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
