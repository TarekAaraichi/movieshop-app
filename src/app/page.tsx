/**
 * Home page (ensured)
 * Server component that renders the app's index/home page and featured movies.
 */

import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import ClientMovieCarousels from "@/components/ClientMovieCarousels";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageThemeContext";
import { Prisma } from "@prisma/client";

export type MovieWithRelations = Prisma.MovieGetPayload<{
  include: {
    genres: { include: { genre: true } };
    people: { include: { person: true } };
  };
}>;

export default async function HomePage() {
  // Fetch all movie lists in parallel for better performance
  const [topPurchased, recentMovies, oldestMovies, cheapMovies] =
    await Promise.all([
      prisma.movie.findMany({
        where: { isArchived: false, orderItems: { some: {} } },
        orderBy: { orderItems: { _count: "desc" } },
        take: 10,
        include: {
          genres: { include: { genre: true } },
          people: { include: { person: true } },
        },
      }),
      prisma.movie.findMany({
        where: { isArchived: false },
        orderBy: { releaseDate: "desc" },
        take: 10,
        include: {
          genres: { include: { genre: true } },
          people: { include: { person: true } },
        },
      }),
      prisma.movie.findMany({
        where: { isArchived: false },
        orderBy: { releaseDate: "asc" },
        take: 10,
        include: {
          genres: { include: { genre: true } },
          people: { include: { person: true } },
        },
      }),
      prisma.movie.findMany({
        where: { isArchived: false },
        orderBy: { price: "asc" },
        take: 10,
        include: {
          genres: { include: { genre: true } },
          people: { include: { person: true } },
        },
      }),
    ]);

  type SerializedMovie = Omit<MovieWithRelations, "price"> & { price: string };

  const serializeMovies = (movies: MovieWithRelations[]): SerializedMovie[] => {
    return movies.map((movie) => ({
      ...movie,
      price: movie.price.toString(),
    }));
  };

  const serializedTopPurchased = serializeMovies(topPurchased);
  const serializedRecentMovies = serializeMovies(recentMovies);
  const serializedOldestMovies = serializeMovies(oldestMovies);
  const serializedCheapMovies = serializeMovies(cheapMovies);

  const headerColorClasses = {
    new: "bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-pink-400",
    popular:
      "bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500",
    classics:
      "bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500",
    cheap:
      "bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-lime-400",
  };

  // Client-loaded carousels (moved to a client component to keep server bundle small)

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 rounded-2xl">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-lg p-8 sm:p-16 text-center mb-12 border border-border shadow-lg">
          {/* Decorative background image optimized with next/image for better LCP */}
          <Image
            src="/images/Hero.jpeg"
            alt="Movie theater scene"
            fill
            priority
            sizes="(max-width: 640px) 640px, 1200px"
            className="object-cover object-center absolute inset-0 -z-10 rounded-lg"
          />
          <div className="absolute inset-0 bg-card/80" />
          <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-transparent to-secondary/25 opacity-40" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-linear-to-br from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Welcome to MovieShop
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted max-w-2xl mx-auto">
              Your one-stop shop for the greatest movies ever made. Discover new
              releases, timeless classics, and hidden gems.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                asChild
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Link href="/movies">Browse All Movies</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="bg-card text-foreground border border-border hover:brightness-95"
              >
                <Link href="/collections">Browse Collections</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Movie Carousels (client-loaded) */}
        <ClientMovieCarousels
          top={serializedTopPurchased}
          recent={serializedRecentMovies}
          oldest={serializedOldestMovies}
          cheap={serializedCheapMovies}
          headerColorClasses={headerColorClasses}
        />
      </div>
    </PageWrapper>
  );
}
