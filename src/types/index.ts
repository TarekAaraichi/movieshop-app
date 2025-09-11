export type GenreRelation = { genre: { id: string; name: string } };

export type ServerMovie = {
  id: string;
  title: string;
  imageUrl?: string | null;
  price: number | string;
  genres?: GenreRelation[] | null;
  releaseDate?: string | null;
  runtime?: number | null;
  rating?: number | null;
};

export type CartClientItem = { movie: ServerMovie; quantity: number; movieId?: string };
