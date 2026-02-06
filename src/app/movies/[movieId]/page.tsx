/**
 * Movie detail page (ensured)
 * Server-rendered page showing detailed movie information, cast, and add-to-cart control.
 *
 * Responsibilities:
 * - Fetch a single movie (including `genres`, `people`, and `_count`) via Prisma.
 * - Use an aggregate SUM over OrderItem.quantity to display real sold units (not just number of order lines).
 * - Format runtime and release date for display and render poster, facts, cast, and Add-to-Cart.
 *
 * Notes:
 * - This is a server component (uses Prisma) and revalidates every 60s (`export const revalidate = 60`).
 * - Poster and person images are rendered with `next/image`; callers should ensure external URLs are allowed in `next.config.js` or `unoptimized` is used as here.
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { AddToCartClientButton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

export const revalidate = 60; // cache for 60s

type Props = {
  params: {
    movieId: string;
  };
};

// Minimal movie shape used on this page (includes relations when fetched)
type Movie = {
  id: string;
  title?: string | null;
  imageUrl?: string | null;
  tagline?: string | null;
  description?: string | null;
  releaseDate?: string | Date | null;
  runtime?: number | null;
  isArchived?: boolean | null;
  rating?: number | null;
  // relation shapes returned when `include` is used
  genres?: { genre: { id: string; name: string } }[] | null;
  people?:
    | {
        person: { id: string; fullName: string; imageUrl?: string | null };
        role: "DIRECTOR" | "ACTOR";
      }[]
    | null;
  _count?: {
    orderItems?: number;
    cartItems?: number;
    genres?: number;
    people?: number;
  } | null;
  director?: string | null; // legacy field
  // language may be a simple string now, or later a relation object { id, code, name }
  language?:
    | string
    | { id: string; code?: string | null; name?: string | null }
    | null;
  price?: unknown; // Prisma Decimal or number/string
  stock?: number | null;
};

export default async function MoviePage({ params }: Props) {
  const { movieId } = params;

  // Parallel: fetch movie & aggregate total units sold (sum of order item quantities)
  const moviePromise = prisma.movie.findUnique({
    where:
      typeof movieId === "string" ? { id: movieId } : { id: movieId as never },
    include: {
      genres: { include: { genre: true } },
      people: { include: { person: true } },
      _count: {
        select: {
          orderItems: true, // distinct order lines (number of orders containing this movie)
          cartItems: true,
          genres: true,
          people: true,
        },
      },
    },
  });
  const aggregatePromise = prisma.orderItem.aggregate({
    where: { movieId },
    _sum: { quantity: true },
  });

  let movieResult, aggregateResult;
  try {
    [movieResult, aggregateResult] = await Promise.all([
      moviePromise,
      aggregatePromise,
    ]);
  } catch (err) {
    console.error("Error fetching movie or aggregate", movieId, err);
    notFound();
  }

  if (!movieResult) {
    notFound();
  }

  const movieTyped = movieResult as unknown as Movie;

  const stock = movieTyped.stock ?? null;

  // Helpers for UI-safe values
  const title: string = movieTyped.title ?? "Untitled";
  const poster: string | null = movieTyped.imageUrl ?? null;
  const tagline: string = movieTyped.tagline ?? "";
  const description: string =
    movieTyped.description ?? "No description available.";
  const release = movieTyped.releaseDate
    ? new Date(movieTyped.releaseDate).toLocaleDateString()
    : "Unknown";
  const rating = movieTyped.rating ?? null;

  let languageValue = "English";
  const isLanguageObject = (v: unknown): v is { name?: string | null } =>
    typeof v === "object" && v !== null && "name" in v;

  if (movieTyped.language) {
    if (typeof movieTyped.language === "string") {
      languageValue = movieTyped.language;
    } else if (
      isLanguageObject(movieTyped.language) &&
      movieTyped.language.name
    ) {
      languageValue = movieTyped.language.name;
    }
  }

  const genres = Array.isArray(movieTyped.genres)
    ? (movieTyped.genres
        .map((mg) => mg.genre?.name)
        .filter(Boolean) as string[])
    : [];

  const director = Array.isArray(movieTyped.people)
    ? movieTyped.people.find((p) => p.role === "DIRECTOR")?.person
    : undefined;
  const actors = Array.isArray(movieTyped.people)
    ? movieTyped.people.filter((p) => p.role === "ACTOR").map((p) => p.person)
    : [];

  // Aggregate totals
  const totalUnitsSold = aggregateResult?._sum.quantity ?? 0;
  const distinctOrders = movieTyped._count?.orderItems ?? 0;

  const formatRuntime = (mins?: number | null) => {
    if (!mins || mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };
  const runtimeFormatted = formatRuntime(movieTyped.runtime ?? null);

  return (
    <PageWrapper>
      <div className="w-full  mx-auto flex items-start gap-2 p-1 rounded-2xl">
        <aside className="flex-shrink-0 p-2">
          <div className="w-64 min-w-[264px] h-[376px] rounded-xl overflow-hidden shadow-xl relative bg-neutral-900">
            {poster ? (
              <Image
                src={poster}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 264px"
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-500">
                <span className="text-sm">No poster available</span>
              </div>
            )}
            {stock === 0 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-white font-bold text-lg tracking-wider">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Buttons placed under the poster in the next row */}
          <div className="mt-4 w-64 min-w-[264px]">
            <div className="w-full">
              <AddToCartClientButton
                movieId={movieId}
                stock={stock}
                disabled={Boolean(movieTyped.isArchived)}
                buttonClassName="rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white hover:from-emerald-600 hover:to-blue-600"
              />
            </div>

            <Link
              href="/movies"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 text-neutral-300 border border-neutral-700 px-4 py-3 text-sm font-medium shadow-lg hover:bg-neutral-700 active:scale-95 transition-all duration-150"
            >
              Back to Movies
            </Link>
          </div>
        </aside>
        <main className="w-full  mx-auto flex-grow p-2">
          <section className="flex flex-row gap-6 items-start p-5 rounded-[14px] bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 border border-neutral-800 shadow-2xl backdrop-blur-md">
            <div className="flex-1 min-w-0">
              <h1 className="text-[32px] font-extrabold m-0 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
                {title}
              </h1>
              {tagline && (
                <p className="text-neutral-400 mt-2 leading-relaxed italic">
                  {tagline}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {genres.map((g, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-white/40 to-slate-300/30 text-white/80 border border-neutral-700 px-3 py-1 text-xs font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-3 items-center">
                <div className="rounded-lg bg-neutral-800/50 px-4 py-3 text-center shadow-sm">
                  <div className="text-xs text-blue-300">Release</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-200">
                    {release}
                  </div>
                </div>
                {runtimeFormatted && (
                  <div className="rounded-lg bg-neutral-800/50 px-4 py-3 text-center shadow-sm">
                    <div className="text-xs text-blue-300">Runtime</div>
                    <div className="mt-1 text-sm font-semibold text-neutral-200">
                      {runtimeFormatted}
                    </div>
                  </div>
                )}
                {stock !== null && stock > 0 && (
                  <div className="rounded-lg bg-neutral-800/50 px-4 py-3 text-center shadow-sm">
                    <div className="text-xs text-yellow-400">Stock</div>
                    <div className="mt-1 text-sm font-semibold text-neutral-200">
                      {stock} left
                    </div>
                  </div>
                )}
              </div>

              <p className="text-neutral-300 mt-4 leading-relaxed">
                {description}
              </p>

              {/* Quick facts */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="text-xs text-neutral-400">Director</div>
                  <div className="mt-1 text-sm font-medium text-neutral-200">
                    {director ? (
                      <Link
                        href={`/persons/${director.id}`}
                        className="hover:underline text-blue-300"
                      >
                        {director.fullName}
                      </Link>
                    ) : (
                      (movieTyped.director ?? "Unknown")
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="text-xs text-neutral-400">Language</div>
                  <div className="mt-1 text-sm font-medium text-neutral-200">
                    {languageValue}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-md bg-neutral-800/50 px-3 py-2">
                  <div className="text-sm text-yellow-400 font-medium">
                    {rating !== null ? `${rating}/10` : "No rating"}
                  </div>
                  <div className="h-4 w-px bg-neutral-700" />
                  <div className="text-xs text-neutral-400">
                    {`${totalUnitsSold} unit${
                      totalUnitsSold === 1 ? "" : "s"
                    } sold`}
                    {distinctOrders > 0 && (
                      <span>{` across ${distinctOrders} order${
                        distinctOrders === 1 ? "" : "s"
                      }`}</span>
                    )}
                  </div>
                </div>

                <a
                  href={`https://www.imdb.com/find?q=${encodeURIComponent(
                    title,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-300 hover:underline"
                >
                  Check external ratings
                </a>
              </div>

              {/* Cast */}
              {actors.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm text-neutral-400 mb-3">Cast</h3>
                  <div className="flex flex-wrap gap-3">
                    {actors.map((a) => (
                      <Link
                        key={a.id}
                        href={`/persons/${a.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-white/40 to-slate-300/30 text-white/80 border border-neutral-800 hover:bg-neutral-700/70 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-900 flex-shrink-0">
                          {a.imageUrl ? (
                            <Image
                              src={a.imageUrl}
                              alt={a.fullName}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-neutral-700" />
                          )}
                        </div>
                        <div className="text-sm font-medium text-neutral-200 hover:text-emerald-400">
                          {a.fullName}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </PageWrapper>
  );
}
