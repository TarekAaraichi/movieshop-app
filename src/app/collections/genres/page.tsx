/**
 * Genres collection index
 * Landing page for browsing movies by genre.
 */

import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getGenresWithMovies() {
  return prisma.genre.findMany({
    include: {
      movies: {
        include: { movie: true },
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
                <article
                  key={mg.movieId}
                  className="bg-gray-900 rounded overflow-hidden flex flex-col"
                >
                  {mg.movie.imageUrl ? (
                    // allow external for dev
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mg.movie.imageUrl}
                      alt={mg.movie.title}
                      className="w-full h-40 object-contain bg-gray-800"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-700 flex items-center justify-center">
                      No image
                    </div>
                  )}
                  <div className="p-2 text-sm flex-1 flex flex-col">
                    <div className="mb-2 line-clamp-2">{mg.movie.title}</div>
                    <div className="mt-auto">
                      <a
                        href={`/movies/${mg.movieId}`}
                        className="flex w-full justify-center items-center gap-2 rounded-md bg-gradient-to-r from-green-400 to-blue-500 text-black text-sm font-medium px-3 py-1.5 shadow-sm hover:scale-105 transition-transform"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
