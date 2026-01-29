/**
 * Home page (ensured)
 * Server component that renders the app's index/home page and featured movies.
 */

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MovieCarousel } from "@/components/MovieCarousel";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 rounded-2xl">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat p-8 sm:p-16 text-center mb-12 border border-primary/30 shadow-2xl shadow-primary/15"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gray-900/75" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-secondary/25 opacity-40" />
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full  bg-black/20 backdrop-blur-sm p-8 rounded-xl"
        />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
            Welcome to MovieShop
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-400 max-w-2xl mx-auto">
            Your one-stop shop for the greatest movies ever made. Discover new
            releases, timeless classics, and hidden gems.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/movies">Browse All Movies</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/collections/top-rated">Top Rated</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Movie Carousels */}
      <div className="space-y-12">
        <MovieCarousel
          title="Top Selling"
          movies={topPurchased}
          viewMoreHref="/collections/top-selling"
        />
        <MovieCarousel
          title="New Releases"
          movies={recentMovies}
          viewMoreHref="/collections/new"
        />
        <MovieCarousel
          title="All-Time Classics"
          movies={oldestMovies}
          viewMoreHref="/collections/classics"
        />
        <MovieCarousel
          title="Budget Friendly"
          movies={cheapMovies}
          viewMoreHref="/collections/budget"
        />
      </div>
    </div>
  );
}
