/**
 * Genres collection index
 * Landing page for browsing movies by genre.
 */

import { MovieCarousel } from "@/components";
import prisma from "@/lib/prisma";
import { PageWrapper } from "@/components/PageThemeContext";

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
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 rounded-2xl">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-sky-400">
            Browse by Genre
          </h1>
        </header>
        <div className="space-y-12">
          {genres.map((genre) => (
            <MovieCarousel
              key={genre.id}
              title={genre.name}
              movies={genre.movies.map((gm) => gm.movie)}
              viewMoreHref={`/collections/genres/${encodeURIComponent(
                genre.name,
              )}`}
            />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
