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
  const query = searchParams.q ?? "";
  const selectedGenre = searchParams.genre ?? "";

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

  return (
    <div className="font-sans min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      <main className="flex-grow p-8 max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Movies
        </h1>

        {/* Search and filter controls - enhanced inline display */}
        <section className="flex flex-wrap items-center mb-8 p-4 bg-gradient-to-r from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-lg gap-4">
          <form
            method="GET"
            className="flex flex-wrap items-center gap-4 w-full"
          >
            <div className="flex items-center flex-grow">
              {/* Client-side controlled search to keep behaviors consistent when combined with genre filter */}
              <MovieSearch initialQuery={query} selectedGenre={selectedGenre} />
            </div>
            <div className="flex-grow sm:flex-grow-0">
              <GenreSelect selectedGenre={selectedGenre} query={query} />
            </div>
          </form>
        </section>

        {/* Movies grid */}
        <div className="min-h-[240px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => {
            const director = movie.people.find((p) => p.role === "DIRECTOR");
            return (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="block bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 p-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-24 h-32 relative rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={movie.imageUrl ?? "/file.svg"}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-100">
                      {movie.title}
                    </h2>
                    <p className="text-sm text-gray-300">
                      {movie.releaseDate
                        ? new Date(
                            movie.releaseDate as unknown as string
                          ).getFullYear()
                        : ""}
                    </p>
                    <p className="text-sm text-green-400 font-semibold">
                      ${Number(movie.price).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-300">
                      Genre: {movie.genres.map((g) => g.genre.name).join(", ")}
                    </p>
                    <p className="text-sm text-gray-300">
                      Runtime: {movie.runtime} min
                    </p>
                    <p className="text-sm text-gray-300">
                      Actors:{" "}
                      {movie.people
                        .filter((p) => p.role === "ACTOR")
                        .map((p, i, arr) => (
                          <span key={p.person.id}>
                            <a
                              href={`/persons/${p.person.id}`}
                              className="text-teal-300 hover:underline"
                            >
                              {p.person.fullName}
                            </a>
                            {i < arr.length - 1 ? ", " : ""}
                          </span>
                        ))}
                    </p>
                    {director && (
                      <p className="text-sm text-gray-400">
                        Director: {director.person.fullName}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
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
