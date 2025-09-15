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
    orderBy: { releaseDate: "desc" },
    take: 5,
    include: {
      people: { include: { person: true } },
      genres: { include: { genre: true } },
    },
  });
  const oldestRaw = await prisma.movie.findMany({
    orderBy: { releaseDate: "asc" },
    take: 5,
    include: {
      people: { include: { person: true } },
      genres: { include: { genre: true } },
    },
  });
  const cheapRaw = await prisma.movie.findMany({
    orderBy: { price: "asc" },
    take: 5,
    include: {
      people: { include: { person: true } },
      genres: { include: { genre: true } },
    },
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
            {/* Render genres if present */}
            {movie.genres && movie.genres.length > 0 && (
              <p className="text-sm text-gray-300">
                {movie.genres.map((g) => g.genre.name).join(", ")}
              </p>
            )}
            {/* Render actors if present */}
            {movie.people && movie.people.length > 0 && (
              <p className="text-sm text-gray-300">
                {" "}
                {movie.people
                  .filter((p) => p.role === "ACTOR")
                  .map((p, i, arr) => (
                    <span
                      key={p.person.id}
                      className="text-teal-300 hover:underline cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/persons/${p.person.id}`)
                      }
                    >
                      {p.person.fullName}
                      {i < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
              </p>
            )}
            {/* Director if present */}
            {/* {movie.people &&
              movie.people.find((p) => p.role === "DIRECTOR") && (
                <p className="text-sm text-gray-400">
                  {" "}
                  <Link
                    href={`/persons/${
                      movie.people.find((p) => p.role === "DIRECTOR")?.person.id
                    }`}
                    className="text-teal-500 hover:underline"
                  >
                    {
                      movie.people.find((p) => p.role === "DIRECTOR")?.person
                        .fullName
                    }
                  </Link>
                </p>
              )} */}
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
            {topPurchasedSummaries.map((m) => (
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
