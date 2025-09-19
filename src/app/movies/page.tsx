// src/app/movies/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import GenreSelect from "@/components/GenreSelect";
import MovieSearch from "@/components/MovieSearch";

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

  // Fetch movies, optionally filtering by title
  // Build `where` dynamically so we only include filters when present
  const where: Prisma.MovieWhereInput = {};
  if (query) {
    Object.assign(where, {
      title: {
        contains: query,
        mode: "insensitive",
      },
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

  // Load distinct genres that are actually used by non-archived movies
  const usedGenres = await prisma.genre.findMany({
    where: {
      movies: {
        some: {
          movie: {
            isArchived: false,
          },
        },
      },
    },
    orderBy: { name: "asc" },
    select: { name: true },
  });
  const genreOptions = usedGenres.map((g) => g.name);

  return (
    <div className="font-sans min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200 antialiased">
      <main className="flex-grow px-4 sm:px-8 max-w-7xl mx-auto w-full pt-12 pb-12 box-border">
        <h1 className="text-5xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Movies
        </h1>

        {/* Search and filter controls - enhanced inline display */}
        <section className="flex flex-wrap items-center mb-4 p-4 bg-gradient-to-r from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-lg gap-4">
          <form
            method="GET"
            className="flex flex-wrap items-center gap-4 w-full"
          >
            <div className="flex items-center flex-grow">
              {/* Client-side controlled search to keep behaviors consistent when combined with genre filter */}
              <MovieSearch initialQuery={query} selectedGenre={selectedGenre} />
            </div>
            <div className="flex-grow sm:flex-grow-0">
              <GenreSelect
                selectedGenre={selectedGenre}
                query={query}
                options={genreOptions}
              />
            </div>
          </form>
        </section>

        {/* Movies grid */}
        <div className="min-h-[240px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-6">
          {movies.map((movie) => {
            const director = movie.people.find((p) => p.role === "DIRECTOR");
            return (
              <div
                key={movie.id}
                className="block bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 p-3"
              >
                <div className="flex flex-col w-full">
                  <Link href={`/movies/${movie.id}`} className="block">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={movie.imageUrl ?? "/file.svg"}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 20vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="mt-3 flex-1 min-w-0">
                      <h2 className="text-lg hover:underline font-semibold text-gray-100 line-clamp-2 break-words">
                        {movie.title}
                      </h2>

                      <div className="mt-1 text-sm text-gray-300 flex flex-col items-start gap-2 w-full">
                        <span className="min-w-0">
                          {movie.releaseDate
                            ? new Date(
                                movie.releaseDate as unknown as string
                              ).getFullYear()
                            : ""}
                        </span>
                        <span className="text-green-400 font-semibold flex-shrink-0">
                          ${Number(movie.price).toFixed(2)}
                        </span>
                      </div>

                      {movie.genres && movie.genres.length > 0 && (
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                          {movie.genres.map((g) => g.genre.name).join(", ")}
                        </p>
                      )}
                    </div>
                  </Link>

                  <div className="mt-2">
                    <p className="text-sm text-gray-300">
                      {movie.people
                        .filter((p) => p.role === "ACTOR")
                        .map((p, i, arr) => (
                          <span key={p.person.id}>
                            <Link
                              href={`/persons/${p.person.id}`}
                              className="text-teal-300 hover:underline"
                            >
                              {p.person.fullName}
                            </Link>
                            {i < arr.length - 1 ? ", " : ""}
                          </span>
                        ))}
                    </p>

                    {director && (
                      <p className="text-sm text-gray-400 mt-2">
                        Director:{" "}
                        <Link
                          href={`/persons/${director.person.id}`}
                          className="text-teal-500 hover:underline"
                        >
                          {director.person.fullName}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {movies.length === 0 && (
            <p className="text-gray-400 col-span-full text-center">
              No movies found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
