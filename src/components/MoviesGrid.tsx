import { MovieCard } from "./MovieCard";
import type { Prisma } from "@prisma/client";

type MovieWithIncludes = Prisma.MovieGetPayload<{
  include: {
    genres: { include: { genre: true } };
  };
}>;

interface MoviesGridProps {
  movies: MovieWithIncludes[];
}

export function MoviesGrid({ movies }: MoviesGridProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold">No movies found</h2>
        <p className="text-muted-foreground mt-2">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
