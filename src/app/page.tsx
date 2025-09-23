/**
 * Home page (ensured)
 * Server component that renders the app's index/home page and featured movies.
 */

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { ServerMovie } from "@/types";

export default async function HomePage() {
  type MovieSummary = ServerMovie & {
    // optional expanded relations
    people?: { person: { id: string; fullName: string }; role: string }[];
    genres?: { genre: { id: string; name: string } }[];
  };
  const topPurchasedRaw = (await prisma.$queryRaw`
    SELECT m.* FROM "Movie" m
    JOIN "OrderItem" oi ON oi."movieId" = m.id
    GROUP BY m.id
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 5
  `) as unknown;
  const topPurchased = (topPurchasedRaw as MovieSummary[] | undefined) ?? [];

  // Fetch lists including people and genres so we can show director/actors/genre on the landing page
  const recentRaw = await prisma.movie.findMany({
    where: { isArchived: false },
    orderBy: { releaseDate: "desc" },
    take: 5,
    include: {
      people: { include: { person: true } },
      genres: { include: { genre: true } },
    },
  });
  const oldestRaw = await prisma.movie.findMany({
    where: { isArchived: false },
    orderBy: { releaseDate: "asc" },
    take: 5,
    include: {
      people: { include: { person: true } },
      genres: { include: { genre: true } },
    },
  });
  const cheapRaw = await prisma.movie.findMany({
    where: { isArchived: false },
    orderBy: { price: "asc" },
    take: 5,
    include: {
      people: { include: { person: true } },
      genres: { include: { genre: true } },
    },
  });

  function serialize(m: unknown): MovieSummary {
    const obj = m as Record<string, unknown>;
    const priceVal = obj.price;
    const price =
      typeof priceVal === "number"
        ? priceVal
        : typeof priceVal === "string"
        ? priceVal
        : priceVal &&
          typeof (priceVal as { toString?: unknown }).toString === "function"
        ? (priceVal as { toString: () => string }).toString()
        : "0";

    return {
      id: String(obj.id),
      title: String(obj.title ?? ""),
      imageUrl: (obj.imageUrl as string) ?? null,
      price,
      releaseDate: obj.releaseDate
        ? new Date(String(obj.releaseDate)).toISOString()
        : null,
    } as MovieSummary;
  }

  // For recent/oldest/cheap we already included related data; convert to serialized summaries
  // Helper to serialize a full movie record (including relations) into MovieSummary
  function serializeFull(m: unknown): MovieSummary {
    const base = serialize(m);
    const mm = m as Record<string, unknown>;
    const people = ((mm.people as unknown) ?? []) as unknown[];
    const genres = ((mm.genres as unknown) ?? []) as unknown[];
    return {
      ...base,
      people: people.map((p: unknown) => {
        const pp = p as Record<string, unknown>;
        const person = pp.person as Record<string, unknown>;
        return {
          role: String(pp.role),
          person: { id: String(person.id), fullName: String(person.fullName) },
        };
      }),
      genres: genres.map((g: unknown) => {
        const gg = g as Record<string, unknown>;
        const genre = gg.genre as Record<string, unknown>;
        return { genre: { id: String(genre.id), name: String(genre.name) } };
      }),
    };
  }

  const topRecent = recentRaw.map((r) => serializeFull(r));
  const topOldest = oldestRaw.map((r) => serializeFull(r));
  const topCheap = cheapRaw.map((r) => serializeFull(r));

  // For top purchased we need the detailed movie records (topPurchased currently has ids)
  const topPurchasedDetailed = (
    await Promise.all(
      topPurchased.map((m) =>
        prisma.movie.findUnique({
          where: { id: m.id },
          include: {
            people: { include: { person: true } },
            genres: { include: { genre: true } },
          },
        })
      )
    )
  ).filter(Boolean) as unknown[];
  const topPurchasedSummaries = topPurchasedDetailed.map((r) =>
    serializeFull(r)
  );

  function MovieCard({ movie }: { movie: MovieSummary }) {
    const imgSrc =
      movie.imageUrl && movie.imageUrl.trim() !== ""
        ? movie.imageUrl
        : "/file.svg";

    // actors are intentionally not rendered here (kept commented in markup)

    return (
      <div className="group p-3">
        <div className="relative flex flex-col h-full min-h-[180px] w-full bg-gradient-to-r from-gray-800/60 to-gray-700/40 border border-gray-700/60 rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-200 ease-out hover:-translate-y-1 overflow-hidden">
          {/* Image area */}
          <Link
            href={`/movies/${movie.id}`}
            className="relative w-full h-48 sm:h-56 md:h-52 lg:h-44 shrink-0 block"
            aria-label={`Open ${movie.title}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <Image
              src={imgSrc}
              alt={movie.title}
              fill
              className="object-cover w-full h-full rounded-t-2xl"
              priority={false}
            />

            {/* Price badge (top-left) */}
            <div className="absolute left-3 top-3 bg-black/60 text-green-300 font-medium text-sm px-3 py-1 rounded-full backdrop-blur-sm border border-green-300/20">
              ${Number(movie.price ?? 0).toFixed(2)}
            </div>

            {/* Year badge (top-right) */}
            {movie.releaseDate && (
              <div className="absolute right-3 top-3 bg-white/6 text-gray-100 text-sm px-2 py-1 rounded-full backdrop-blur-sm border border-white/6">
                {new Date(movie.releaseDate).getFullYear()}
              </div>
            )}
          </Link>

          {/* Genres as modern chips */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {movie.genres.map((g) => (
                <span
                  key={g.genre.id}
                  className="text-xs px-2 py-0.5 rounded-md backdrop-blur-sm bg-gradient-to-r from-white/40 to-slate-300/30 text-white/80 border border-white/10"
                >
                  {g.genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="p-3 flex-1 flex flex-col gap-2">
            <Link
              href={`/movies/${movie.id}`}
              className="text-base sm:text-lg font-semibold text-gray-100 hover:text-white hover:underline line-clamp-2"
            >
              {movie.title}
            </Link>

            <Link
              href={`/movies/${movie.id}`}
              className="flex mt-auto min-w-0  w-full justify-center items-center gap-2 rounded-md bg-gradient-to-r from-green-400 to-blue-500 text-black text-sm font-medium px-3 py-1.5 shadow-sm hover:scale-105 transition-transform"
              aria-label={`View details for ${movie.title}`}
            >
              View
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200 antialiased">
      <main className="flex-grow px-4 sm:px-8 max-w-7xl mx-auto w-full pt-12 pb-12 box-border">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Explore Our Movies
        </h1>

        {topPurchasedSummaries.length > 0 && (
          <section className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-yellow-400">
              Top 5 Most Purchased
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {topPurchasedSummaries.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">
            Top 5 Most Recent
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topRecent.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">
            Top 5 Oldest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topOldest.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-teal-400">
            Top 5 Cheapest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topCheap.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
