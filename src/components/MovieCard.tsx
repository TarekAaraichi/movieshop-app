import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddToCartClientButton } from "@/components";
import type { Decimal } from "@prisma/client/runtime/library";

// Lightweight movie shape expected by card: not strictly tied to Prisma Movie type
type MovieWithGenres = {
  id: string;
  title: string;
  releaseDate?: string | Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  rating?: number | null;
  description?: string | null;
  runtime?: number | null;
  imageUrl?: string | null;
  genres?: { genre: { name: string } }[];
  price?: number | string | Decimal | null;
  stock?: number | null;
  people?:
    | {
        role: string;
        person: { id: string; fullName: string };
      }[]
    | null;
};

interface MovieCardProps {
  movie: MovieWithGenres;
  compact?: boolean; // optional variant for denser lists
}

export function MovieCard({ movie, compact = false }: MovieCardProps) {
  const img = movie.imageUrl?.trim() ? movie.imageUrl : "/placeholder.svg";
  const price = Number(movie.price ?? 0).toFixed(2);
  const stock = typeof movie.stock === "number" ? movie.stock : undefined;
  const director = Array.isArray(movie.people)
    ? movie.people.find((p) => p.role === "DIRECTOR")?.person
    : undefined;
  const actors = Array.isArray(movie.people)
    ? movie.people.filter((p) => p.role === "ACTOR").map((p) => p.person)
    : [];
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : undefined;

  return (
    <Card
      className={
        "group relative overflow-hidden flex flex-col h-full w-full min-w-0 transition duration-200 ease-in-out hover:scale-105 hover:shadow-2xl rounded-xl pt-0 bg-card dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-border dark:border-[rgba(255,255,255,0.04)] shadow-md dark:shadow-[0_6px_30px_rgba(2,6,23,0.6)] dark:backdrop-blur-sm"
      }
    >
      <CardHeader className="p-0">
        <Link href={`/movies/${movie.id}`} className="block">
          <div className="relative w-full aspect-2/3 rounded-t-xl overflow-hidden shadow-inner bg-card border-b border-border dark:border-[rgba(255,255,255,0.04)]">
            <Image
              src={img}
              alt={movie.title}
              fill
              sizes={
                compact
                  ? "(max-width: 640px) 50vw, 20vw"
                  : "(max-width: 640px) 100vw, 20vw"
              }
              className="object-cover object-center w-full h-full"
            />

            {/* subtle overlay for contrast */}
            <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

            {/* price badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-linear-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold shadow-sm">
                SEK{price}
              </span>
            </div>

            {/* low stock badge */}
            {typeof stock === "number" && stock > 0 && stock <= 5 && (
              <div className="absolute bottom-3 left-3 z-10">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-600 text-white text-xs font-semibold shadow-sm">
                  Only {stock} left
                </span>
              </div>
            )}

            {/* out of stock overlay */}
            {stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-base">
                  Out of stock
                </span>
              </div>
            )}
          </div>
        </Link>
      </CardHeader>

      <CardContent className={compact ? "p-3" : "p-4 grow"}>
        <Link href={`/movies/${movie.id}`}>
          <CardTitle className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 truncate text-foreground">
            {movie.title}
          </CardTitle>
        </Link>

        {year && <div className="mt-1 text-sm text-muted">{year}</div>}

        {movie.genres && (
          <div className="mt-2 flex flex-wrap gap-2">
            {movie.genres.slice(0, 3).map((g, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-card text-muted border border-border px-2 py-0.5 text-xs font-medium"
              >
                {g.genre.name}
              </span>
            ))}
          </div>
        )}

        {/* Director + main cast */}
        <div className="mt-3 text-sm text-muted">
          <div className="text-xs text-muted">Director</div>
          <div className="mt-1">
            {director ? (
              <Link
                href={`/persons/${director.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {director.fullName}
              </Link>
            ) : (
              <span className="text-muted">Unknown</span>
            )}
          </div>

          {actors.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-muted">Starring</div>
              <div className="mt-1 text-sm text-foreground">
                {actors.slice(0, 2).map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && ", "}
                    <Link href={`/persons/${a.id}`} className="hover:underline">
                      {a.fullName}
                    </Link>
                  </span>
                ))}
                {actors.length > 2 && (
                  <span className="text-muted">{` +${actors.length - 2}`}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter
        className={
          compact ? "p-3 pt-0" : "p-4 pt-0 flex justify-end items-center"
        }
      >
        <div>
          {stock === 0 ? (
            <span className="text-sm font-semibold text-red-600 dark:text-destructive">
              Sold out
            </span>
          ) : (
            <AddToCartClientButton
              movieId={movie.id}
              stock={stock}
              buttonClassName="rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 px-3 py-2 text-sm font-semibold text-white hover:from-emerald-600 hover:to-blue-600"
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
