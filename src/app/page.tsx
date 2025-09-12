import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
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
        className="block bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 p-3"
      >
        <div className="flex items-center gap-4">
          <div className="w-24 h-32 relative rounded-lg overflow-hidden shadow-md">
            <Image
              src={movie.imageUrl ?? "/file.svg"}
              alt={movie.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-100">{movie.title}</h3>
            <p className="text-sm text-gray-300">
              {movie.releaseDate
                ? new Date(movie.releaseDate).getFullYear()
                : ""}
            </p>
            <p className="text-sm text-green-400 font-semibold">
              ${Number(movie.price).toFixed(2)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="font-sans min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      <main className="flex-grow p-8 max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Explore Our Movies
        </h1>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-green-400">
            Top 5 Most Purchased
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {topPurchased.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">
            Top 5 Most Recent
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {topRecent.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">
            Top 5 Oldest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {topOldest.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-teal-400">
            Top 5 Cheapest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {topCheap.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
