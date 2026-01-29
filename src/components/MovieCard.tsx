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
import type { Movie } from "@prisma/client";

// Movie shape expected by card: includes genres and optional stock/price
type MovieWithGenres = Movie & {
  genres?: { genre: { name: string } }[];
  stock?: number | null;
  price?: number | string | null;
  imageUrl?: string | null;
  people?:
    | {
        person: { id: string; fullName: string; imageUrl?: string | null };
        role: "DIRECTOR" | "ACTOR";
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
        "group relative overflow-hidden flex flex-col h-full w-full min-w-0 transition duration-200 ease-in-out hover:scale-105 hover:shadow-2xl rounded-xl pt-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-[rgba(255,255,255,0.04)] shadow-[0_6px_30px_rgba(2,6,23,0.6)] backdrop-blur-sm"
      }
    >
      <CardHeader className="p-0">
        <Link href={`/movies/${movie.id}`} className="block">
          <div className="relative w-full aspect-[2/3] rounded-t-xl overflow-hidden shadow-xl bg-slate-900 border border-[rgba(255,255,255,0.04)] border-b-0">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

            {/* price badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold shadow-sm">
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

      <CardContent className={compact ? "p-3" : "p-4 flex-grow"}>
        <Link href={`/movies/${movie.id}`}>
          <CardTitle className="text-base sm:text-lg font-semibold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 line-clamp-2 truncate">
            {movie.title}
          </CardTitle>
        </Link>

        {year && <div className="mt-1 text-sm text-slate-400">{year}</div>}

        {movie.genres && (
          <div className="mt-2 flex flex-wrap gap-2">
            {movie.genres.slice(0, 3).map((g, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md backdrop-blur-sm bg-gradient-to-r from-white/40 to-slate-300/30 text-white/80 border border-white/10 px-2 py-0.5 text-xs font-medium"
              >
                {g.genre.name}
              </span>
            ))}
          </div>
        )}

        {/* Director + main cast */}
        <div className="mt-3 text-sm text-slate-300">
          <div className="text-xs text-slate-400">Director</div>
          <div className="mt-1">
            {director ? (
              <Link
                href={`/persons/${director.id}`}
                className="font-medium text-slate-100 hover:underline"
              >
                {director.fullName}
              </Link>
            ) : (
              <span className="text-slate-400">Unknown</span>
            )}
          </div>

          {actors.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-slate-400">Starring</div>
              <div className="mt-1 text-sm text-slate-200">
                {actors.slice(0, 2).map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && ", "}
                    <Link href={`/persons/${a.id}`} className="hover:underline">
                      {a.fullName}
                    </Link>
                  </span>
                ))}
                {actors.length > 2 && (
                  <span className="text-slate-400">{` +${actors.length - 2}`}</span>
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
            <span className="text-sm font-semibold text-destructive">
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
