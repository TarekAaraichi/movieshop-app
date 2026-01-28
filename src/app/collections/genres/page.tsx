/**
 * Genres collection index
 * Landing page for browsing movies by genre.
 */

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { MovieCard } from "@/components";

async function getGenresWithMovies() {
  return prisma.genre.findMany({
    include: {
      movies: {
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
              people: { include: { person: true } },
            },
          },
        },
        take: 5,
      },
    },
  });
}

export default async function GenresPage() {
  const genres = await getGenresWithMovies();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Genres</h1>
      <div className="space-y-8">
        {genres.map((g) => (
          <section key={g.id}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{g.name}</h2>
              <Link
                href={`/collections/genres/${encodeURIComponent(g.name)}`}
                className="text-sm text-indigo-400"
              >
                View more
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {g.movies.map((mg) => (
                <MovieCard key={mg.movieId} movie={mg.movie} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
