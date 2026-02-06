"use client";

import { usePageTheme } from "./PageThemeContext";
import { MovieCard } from "./MovieCard";
import Link from "next/link";
import CarouselControls from "./CarouselControls";
import type { Prisma } from "@prisma/client";

type MovieWithIncludes = Prisma.MovieGetPayload<{
  include: {
    genres: { include: { genre: true } };
  };
}>;

interface MovieCarouselProps {
  title: string;
  movies: MovieWithIncludes[];
  viewMoreHref?: string;
}

export function MovieCarousel({
  title,
  movies,
  viewMoreHref,
}: MovieCarouselProps) {
  const { theme } = usePageTheme();

  if (movies.length === 0) {
    return null;
  }

  const id = `carousel-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-3xl font-bold"
          style={{ color: theme === "dark" ? "white" : "black" }}
        >
          {title}
        </h2>
        {viewMoreHref ? (
          <Link
            href={viewMoreHref}
            className="text-sm text-gray-700 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 underline font-medium"
          >
            View more
          </Link>
        ) : null}
      </div>
      <div className="relative group">
        <div
          id={id}
          tabIndex={0}
          aria-label={`${title} carousel`}
          role="list"
          className="flex gap-4 md:gap-6 overflow-x-auto px-4 py-5 snap-x snap-mandatory focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg hide-scrollbar"
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              role="listitem"
              className="shrink-0 w-40 sm:w-50 snap-start"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        <CarouselControls containerId={id} />
      </div>
    </section>
  );
}
