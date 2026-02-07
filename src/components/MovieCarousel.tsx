"use client";

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
  if (movies.length === 0) {
    return null;
  }

  const id = `carousel-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200">
          {title}
        </h2>
        {viewMoreHref ? (
          <Link
            href={viewMoreHref}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors"
          >
            View more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ) : null}
      </div>
      <div className="relative group">
        <div
          id={id}
          tabIndex={0}
          aria-label={`${title} carousel`}
          role="list"
          className="flex gap-4 md:gap-6 overflow-x-auto px-4 py-5 snap-x snap-mandatory focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg hide-scrollbar bg-gray-100/50 dark:bg-transparent"
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              role="listitem"
              className="shrink-0 w-44 sm:w-52 snap-start"
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
