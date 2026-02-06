import prisma from "@/lib/prisma";
import { MovieCard, MoviesGridSkeleton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";
import { Suspense } from "react";

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

export default function GenrePage({ params }: Props) {
  const { genre } = params;

  async function GenreGrid() {
    const movies = await getMoviesForGenre(genre);
    if (movies.length === 0) {
      return (
        <div className="text-center text-neutral-500 dark:text-neutral-400 py-12">
          No movies found for this genre.
        </div>
      );
    }
    return (
      <div className="min-h-[120px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
            {genre.charAt(0).toUpperCase() + genre.slice(1)} Movies
          </h1>
        </header>
        <Suspense fallback={<MoviesGridSkeleton count={10} />}>
          <GenreGrid />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
