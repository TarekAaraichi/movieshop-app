import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { MovieCard } from "@/components";

type Props = { params: { genre: string } };

async function getMoviesForGenre(name: string) {
  const g = await prisma.genre.findUnique({
    where: { name },
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
      },
    },
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
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}
