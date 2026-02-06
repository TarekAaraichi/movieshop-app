/**
 * Home page (ensured)
 * Server component that renders the app's index/home page and featured movies.
 */

import prisma from "@/lib/prisma";
import Link from "next/link";
import { MovieCarousel } from "@/components/MovieCarousel";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageThemeContext";

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
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 rounded-2xl">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat p-8 sm:p-16 text-center mb-12 border border-primary/30 shadow-2xl shadow-primary/15 bg-[url('/images/Hero.jpeg')]">
          <div className="absolute inset-0 bg-gray-900/75" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-secondary/25 opacity-40" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Welcome to MovieShop
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200 dark:text-gray-300 max-w-2xl mx-auto">
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
                className="bg-gray-700/50 hover:bg-gray-600/50 text-white"
              >
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
    </PageWrapper>
  );
}
