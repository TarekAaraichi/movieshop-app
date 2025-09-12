import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
  // Top 5 most purchased (by sum of order items)
  type MovieSummary = {
    id: string;
    title: string;
    imageUrl?: string | null;
    price: string;
    releaseDate?: string | null;
  };
  const topPurchasedRaw = (await prisma.$queryRaw`
    SELECT m.* FROM "Movie" m
    JOIN "OrderItem" oi ON oi."movieId" = m.id
    GROUP BY m.id
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 5
  `) as unknown;
  const topPurchased = (topPurchasedRaw as MovieSummary[] | undefined) ?? [];

  // Top 5 most recent
  const recentRaw = await prisma.movie.findMany({
    orderBy: { releaseDate: "desc" },
    take: 5,
  });
  const oldestRaw = await prisma.movie.findMany({
    orderBy: { releaseDate: "asc" },
    take: 5,
  });
  const cheapRaw = await prisma.movie.findMany({
    orderBy: { price: "asc" },
    take: 5,
  });

  function serialize(m: unknown): MovieSummary {
    const obj = m as Record<string, unknown>;
    return {
      id: String(obj.id),
      title: String(obj.title ?? ""),
      imageUrl: (obj.imageUrl as string) ?? null,
      price:
        typeof obj.price === "object" &&
        obj.price !== null &&
        typeof (obj.price as { toString?: unknown }).toString === "function"
          ? (obj.price as { toString: () => string }).toString()
          : String(obj.price ?? "0"),
      releaseDate: obj.releaseDate
        ? new Date(String(obj.releaseDate)).toISOString()
        : null,
    };
  }

  const topRecent = recentRaw.map((r) => serialize(r));
  const topOldest = oldestRaw.map((r) => serialize(r));
  const topCheap = cheapRaw.map((r) => serialize(r));

  function MovieCard({ movie }: { movie: MovieSummary }) {
    return (
      <Link
        href={`/movies/${movie.id}`}
        className="block bg-gray-800 rounded-md shadow hover:bg-gray-700 transition p-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-20 h-28 relative rounded overflow-hidden">
            <Image
              src={movie.imageUrl ?? "/file.svg"}
              alt={movie.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-teal-300">
              {movie.title}
            </h3>
            <p className="text-sm text-gray-400">
              {movie.releaseDate
                ? new Date(movie.releaseDate).getFullYear()
                : ""}
            </p>
            <p className="text-sm text-gray-400">
              ${Number(movie.price).toFixed(2)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="font-sans min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <main className="flex-grow p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8">Welcome to MovieShop</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top 5 Most Purchased</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {topPurchased.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top 5 Most Recent</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {topRecent.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top 5 Oldest</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {topOldest.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top 5 Cheapest</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {topCheap.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
