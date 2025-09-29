import { prisma } from "@/lib/prisma";
import Image from "next/image";

type Props = { params: { genre: string } };

async function getMoviesForGenre(name: string) {
  const g = await prisma.genre.findUnique({
    where: { name },
    include: { movies: { include: { movie: true } } },
  });
  return g?.movies.map((m) => m.movie) ?? [];
}

/**
 * Genre page (ensured)
 * Server page that lists movies for a specific genre.
 */

export default async function GenrePage({ params }: Props) {
  const { genre } = params;
  const movies = await getMoviesForGenre(genre);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{genre} movies</h1>
      {movies.length === 0 ? (
        <p>No movies found for this genre.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {movies.map((m) => (
            <article
              key={m.id}
              className="bg-gray-900 rounded overflow-hidden flex flex-col"
            >
              {m.imageUrl ? (
                <div className="relative w-full aspect-[2/3] bg-gray-900 overflow-hidden">
                  <Image
                    src={m.imageUrl}
                    alt={m.title || "Movie poster"}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-[2/3] bg-gray-700 flex items-center justify-center text-xs text-gray-300">
                  No image
                </div>
              )}

              <div className="p-3 flex-1 flex flex-col">
                <div className="text-sm font-medium mb-2 line-clamp-2">
                  {m.title}
                </div>
                <a
                  href={`/movies/${m.id}`}
                  className="mt-auto flex w-full justify-center items-center gap-2 rounded-md bg-gradient-to-r from-green-400 to-blue-500 text-black text-sm font-medium px-3 py-1.5 shadow-sm hover:scale-105 transition-transform"
                >
                  View
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
