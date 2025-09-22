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
      <div className="group bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 p-3 flex flex-col h-full min-h-[160px] w-full overflow-hidden">
        {/* stacked layout: image on top, details below (always stacked) */}
        <div className="flex flex-col items-start gap-4">
          <Link
            href={`/movies/${movie.id}`}
            className="relative shadow-md w-full h-48 rounded-[10px] overflow-hidden"
            aria-label={`Open ${movie.title}`}
          >
            {/* responsive Image: parent controls size, use fill for full coverage */}
            <Image
              src={imgSrc}
              alt={movie.title}
              fill
              className="object-cover"
            />
          </Link>

          <div className="min-w-0 flex-1 flex flex-col">
            <Link
              href={`/movies/${movie.id}`}
              className="text-lg sm:text-xl font-bold text-gray-100 hover:underline line-clamp-2 break-words"
            >
              {movie.title}
            </Link>

            {/* release year and price: stacked on small, row on lg */}
            <div className="mt-1 text-sm text-gray-300 flex flex-col items-start gap-2 w-full">
              <span className="min-w-0">
                {movie.releaseDate
                  ? new Date(movie.releaseDate).getFullYear()
                  : ""}
              </span>
              <span className="text-green-400 font-semibold flex-shrink-0">
                ${Number(movie.price ?? 0).toFixed(2)}
              </span>
            </div>

            {/* Render genres if present */}
            {movie.genres && movie.genres.length > 0 && (
              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                {movie.genres.map((g) => g.genre.name).join(", ")}
              </p>
            )}

            {/* Render actors as links (no event handlers, no nested anchors) */}
            {/* {actors.length > 0 && (
              <p className="text-sm text-gray-300 mt-auto">
                {actors.map((p, i) => (
                  <Link
                    key={p.person.id}
                    href={`/persons/${p.person.id}`}
                    className="text-teal-300 hover:underline"
                  >
                    {p.person.fullName}
                    {i < actors.length - 1 ? ", " : ""}
                  </Link>
                ))}
              </p> */}
            {/* )} */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-6">
            {topRecent.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">
            Top 5 Oldest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-6">
            {topOldest.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-teal-400">
            Top 5 Cheapest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-6">
            {topCheap.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
