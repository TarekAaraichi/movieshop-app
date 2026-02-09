import { PageWrapper } from "@/components/PageThemeContext";
import Link from "next/link";

/**
 * Collections index
 * Server page listing movie collections like top-rated, new, and genres.
 */

const collections = [
  {
    href: "/collections/new",
    title: "New Releases",
    description: "The latest and greatest movies, just for you.",
    bgClass: "from-sky-400 to-pink-400",
  },
  {
    href: "/collections/top-rated",
    title: "Top Rated",
    description: "Discover the highest-rated movies by our community.",
    bgClass: "from-yellow-400 to-pink-400",
  },
  {
    href: "/collections/top-selling",
    title: "Top Selling",
    description: "Our most purchased titles.",
    bgClass: "from-orange-400 to-pink-500",
  },
  {
    href: "/collections/classics",
    title: "All-Time Classics",
    description: "Older films worth revisiting.",
    bgClass: "from-yellow-400 to-orange-500",
  },
  {
    href: "/collections/budget",
    title: "Budget Friendly",
    description: "Great movies that won't break the bank.",
    bgClass: "from-green-400 to-lime-400",
  },
  {
    href: "/collections/genres",
    title: "By Genre",
    description: "Browse movies by their genre.",
    bgClass: "from-purple-400 to-indigo-500",
  },
];

export default function CollectionsIndex() {
  return (
    <PageWrapper>
      <div className="flex flex-col grow items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto p-6 sm:p-8 bg-card rounded-2xl">
          <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground">
              Movie Collections
            </h1>
            <p className="mt-3 text-lg text-muted">
              Explore our curated selections of movies.
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
              <Link
                key={col.href}
                href={col.href}
                className="block p-6 rounded-lg transition-transform transform hover:scale-105 bg-card shadow-md hover:shadow-xl border border-border"
              >
                <h2
                  className={`text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r ${col.bgClass}`}
                >
                  {col.title}
                </h2>
                <p className="mt-2 text-muted">{col.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
