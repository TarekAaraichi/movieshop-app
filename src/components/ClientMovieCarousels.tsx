"use client";
import React from "react";
import dynamic from "next/dynamic";
import type { MovieForCarousel } from "./MovieCarousel";

const MovieCarousel = dynamic(
  () => import("./MovieCarousel").then((m) => m.MovieCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-1/4 mb-4 rounded-lg sk-rect animate-pulse" />
        <div className="flex space-x-6 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 w-52 shrink-0 rounded-lg sk-rect-2 animate-pulse"
            />
          ))}
        </div>
      </div>
    ),
  },
);

type Props = {
  top: MovieForCarousel[];
  recent: MovieForCarousel[];
  oldest: MovieForCarousel[];
  cheap: MovieForCarousel[];
  headerColorClasses: Record<string, string>;
};

export default function ClientMovieCarousels({
  top,
  recent,
  oldest,
  cheap,
  headerColorClasses,
}: Props) {
  return (
    <div className="space-y-12">
      <MovieCarousel
        title="Top Purchased"
        movies={top}
        viewMoreHref="/collections/popular"
        headerClassName={headerColorClasses.popular}
      />
      <MovieCarousel
        title="Recent Releases"
        movies={recent}
        viewMoreHref="/collections/new"
        headerClassName={headerColorClasses.new}
      />
      <MovieCarousel
        title="Oldest Classics"
        movies={oldest}
        viewMoreHref="/collections/classics"
        headerClassName={headerColorClasses.classics}
      />
      <MovieCarousel
        title="Cheap Thrills"
        movies={cheap}
        viewMoreHref="/collections/cheap"
        headerClassName={headerColorClasses.cheap}
      />
    </div>
  );
}
