/**
 * Top-selling collection page
 * Lists movies ordered by total purchases (orderItems count)
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { MovieCard } from "@/components";

interface Props {
  searchParams?: { page?: string; per_page?: string };
}

export default async function TopSellingPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const page = Number(sp.page ?? "1");
  const perPage = Number(sp.per_page ?? "20");
  const skip = (page - 1) * perPage;

  const where: Prisma.MovieWhereInput = { isArchived: false };

  const totalCount = await prisma.movie.count({ where });

  const movies = await prisma.movie.findMany({
    where,
    orderBy: { orderItems: { _count: "desc" } },
    take: perPage,
    skip,
    include: {
      genres: { include: { genre: true } },
      people: { include: { person: true } },
    },
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Top Selling</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Our most purchased titles.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m as any} />
        ))}
      </div>
    </div>
  );
}
