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

    const year = movie.releaseDate
      ? new Date(movie.releaseDate).getFullYear()
      : null;
    const genres = movie.genres?.slice(0, 3) || [];

    return (
      <article
        className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/70 via-gray-800/50 to-gray-700/50 border border-white/6 shadow-lg transition-[transform,box-shadow,filter] duration-[220ms] ease-[cubic-bezier(.2,.9,.2,1)] will-change-[transform] hover:shadow-[0_20px_40px_rgba(2,6,23,0.6)] hover:-translate-y-2 hover:scale-105"
        aria-label={movie.title}
      >
        {/* Poster */}
        <Link
          href={`/movies/${movie.id}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          aria-label={`Open ${movie.title}`}
        >
          <div className="relative w-full aspect-[2/3] min-h-[220px] max-h-[420px] bg-[#071022] overflow-hidden">
            <Image
              src={imgSrc}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 100vw, 20vw"
              className="object-contain object-center w-full h-full transition-[transform,filter] duration-[300ms] ease-[cubic-bezier(.2,.9,.2,1)] group-hover:scale-[1.02] group-hover:brightness-[1.03]"
              priority={false}
            />
            {/* Price badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-300 to-blue-400 text-black text-sm font-semibold">
                SEK{Number(movie.price ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </Link>

        <div className="p-4 flex flex-col h-full">
          <h2 className="text-base sm:text-lg font-semibold text-gray-100 hover:text-white line-clamp-2">
            <Link href={`/movies/${movie.id}`} className="hover:underline">
              {movie.title}
            </Link>
          </h2>

          <div className="mt-2 flex items-center justify-between text-sm text-gray-300">
            <span>{year ?? "—"}</span>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2">
                {genres.map((g) => (
                  <span
                    key={g.genre.id}
                    className="text-xs px-2 py-0.5 rounded-md backdrop-blur-sm bg-gradient-to-r from-white/40 to-slate-300/30 text-white/80 border border-white/10"
                  >
                    {g.genre.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Use regular top margin instead of mt-auto to guarantee visibility even if card height collapses */}
          <div className="mt-4">
            <Link
              href={`/movies/${movie.id}`}
              className="flex w-full justify-center items-center gap-2 rounded-md bg-gradient-to-r from-green-400 to-blue-500 text-black text-sm font-medium px-3 py-1.5 shadow-sm hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
              aria-label={`View details for ${movie.title}`}
            >
              View
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div>
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
