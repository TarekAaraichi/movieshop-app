/**
 * New releases collection page
 * Lists recently added movies.
 */

import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getRecentMovies() {
  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setMonth(now.getMonth() - 1);
  const lastYear = new Date(now);
  lastYear.setFullYear(now.getFullYear() - 1);

  const recent = await prisma.movie.findMany({
    where: { releaseDate: { gte: lastMonth } },
    orderBy: { releaseDate: "desc" },
    take: 20,
  });
  const year = await prisma.movie.findMany({
    where: { releaseDate: { gte: lastYear, lt: lastMonth } },
    orderBy: { releaseDate: "desc" },
    take: 50,
  });
  return { recent, year };
}

export default async function NewReleasesPage() {
  const { recent, year } = await getRecentMovies();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New releases</h1>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Last month</h2>
        {recent.length === 0 ? (
          <p>No releases in the last month.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recent.map((m) => (
              <Link
                key={m.id}
                href={`/movies/${m.id}`}
                className="block bg-gray-900 rounded p-2"
              >
                {m.title}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Last year</h2>
        {year.length === 0 ? (
          <p>No releases in the last year.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {year.map((m) => (
              <Link
                key={m.id}
                href={`/movies/${m.id}`}
                className="block bg-gray-900 rounded p-2"
              >
                {m.title}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
