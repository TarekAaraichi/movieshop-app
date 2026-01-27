/**
 * Shared Types
 * Central location for TypeScript types used across server and client code.
 */

export type GenreRelation = { genre: { id: string; name: string } };

export type ServerMovie = {
  id: string;
  title: string;
  imageUrl?: string | null;
  price: number | string;
  stock?: number | null;
  genres?: GenreRelation[] | null;
  releaseDate?: string | null;
  runtime?: number | null;
  rating?: number | null;
};

export type CartClientItem = {
  movie: ServerMovie;
  quantity: number;
  movieId?: string;
};
