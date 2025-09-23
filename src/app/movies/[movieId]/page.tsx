import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddToCartClientButton } from "@/components";

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
};

export default async function MoviePage({ params }: Props) {
    const { movieId } = params;

    // Lookup movie by id and include related genres and people
    let movie;
    try {
        movie = await prisma.movie.findUnique({
            where:
                typeof movieId === "string"
                    ? { id: movieId }
                    : { id: movieId as never },
            include: {
                genres: { include: { genre: true } },
                people: { include: { person: true } },
                _count: {
                    select: {
                        orderItems: true,
                        cartItems: true,
                        genres: true,
                        people: true,
                    },
                },
            },
        });
    } catch (err) {
        console.error("Error fetching movie", movieId, err);
        notFound();
    }

    if (!movie) {
        notFound();
    }

    const movieTyped = movie as unknown as Movie;

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

    const formatRuntime = (mins?: number | null) => {
        if (!mins || mins <= 0) return "";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    };
    const runtimeFormatted = formatRuntime(movieTyped.runtime ?? null);

    // Stock computation and theme-friendly classes (mirrors person page palette)
    const stockLeft =
        movieTyped._count?.orderItems !== undefined
            ? Math.max(0, 12 - (movieTyped._count.orderItems ?? 0))
            : null;

    const stockLabel =
        stockLeft === null
            ? "In stock"
            : stockLeft === 0
            ? "Out of stock"
            : stockLeft <= 3
            ? `Only ${stockLeft} left`
            : `${stockLeft} in stock`;

    let stockClass = "bg-emerald-50 text-emerald-700";
    if (stockLeft === null) {
        stockClass = "bg-emerald-50 text-emerald-700";
    } else if (stockLeft === 0) {
        stockClass = "bg-red-50 text-red-700";
    } else if (stockLeft <= 3) {
        stockClass = "bg-amber-50 text-amber-700";
    } else {
        stockClass = "bg-emerald-50 text-emerald-700";
    }

    return (
        <main >
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-6 flex items-center gap-3 text-sm text-neutral-500">
                    <Link href="/movies" className="hover:underline">
                        Movies
                    </Link>
                    <span>/</span>
                    <span className="text-neutral-800 truncate font-medium">{title}</span>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Poster & Purchase */}
                    <div className="col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-neutral-100 bg-white">
                                {poster ? (
                                    <Image
                                        src={poster}
                                        alt={title}
                                        width={700}
                                        height={1050}
                                        className="h-auto w-full object-cover"
                                        priority
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex h-[560px] w-full items-center justify-center bg-gradient-to-br from-neutral-50 to-white text-neutral-400">
                                        <span className="text-sm">No poster available</span>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-xs text-neutral-500">Price</div>
                                        <div className="mt-1 flex items-baseline gap-2">
                                            <div className="text-2xl font-extrabold text-neutral-900">
                                                {movieTyped.price ? `$${String(movieTyped.price)}` : "—"}
                                            </div>
                                            {rating !== null && (
                                                <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                                                    ★ {rating}/10
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${stockClass}`}
                                        >
                                            <span className="font-semibold">{stockLabel}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-3">
                                    <div className="flex-1">
                                        <div className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow hover:from-indigo-700 hover:to-indigo-600 transition">
                                            <AddToCartClientButton
                                                movieId={movieId}
                                                disabled={
                                                    Boolean(movieTyped.isArchived) ||
                                                    (movieTyped._count?.orderItems !== undefined
                                                        ? Math.max(0, 12 - (movieTyped._count.orderItems ?? 0)) === 0
                                                        : false)
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Link
                                        href="/movies"
                                        className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 transition"
                                    >
                                        Back
                                    </Link>
                                </div>

                                <p className="mt-3 text-xs text-neutral-500">
                                    Secure checkout · 30-day returns · {movieTyped.isArchived ? "Archived" : "Ships within 24h"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="col-span-2">
                        <header className="flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">{title}</h1>
                                    {tagline && (
                                        <p className="mt-1 text-sm text-neutral-500 italic">{tagline}</p>
                                    )}

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        {genres.map((g, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                                            >
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end space-y-3">
                                    <div className="rounded-lg bg-gradient-to-br from-white to-neutral-50 px-4 py-3 text-center shadow-sm">
                                        <div className="text-xs text-neutral-500">Release</div>
                                        <div className="mt-1 text-sm font-semibold text-neutral-900">{release}</div>
                                    </div>
                                    {runtimeFormatted && (
                                        <div className="rounded-lg bg-gradient-to-br from-white to-neutral-50 px-4 py-3 text-center shadow-sm">
                                            <div className="text-xs text-neutral-500">Runtime</div>
                                            <div className="mt-1 text-sm font-semibold text-neutral-900">{runtimeFormatted}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 rounded-md bg-white px-3 py-2 shadow">
                                    <div className="text-sm font-medium text-neutral-700">
                                        {rating !== null ? `${rating}/10` : "No rating"}
                                    </div>
                                    <div className="h-4 w-px bg-neutral-200" />
                                    <div className="text-xs text-neutral-500">
                                        {movieTyped._count ? `${movieTyped._count.orderItems ?? 0} sold` : ""}
                                    </div>
                                </div>

                                <a
                                    href={`https://www.imdb.com/find?q=${encodeURIComponent(title)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-neutral-600 hover:underline"
                                >
                                    Check external ratings
                                </a>
                            </div>
                        </header>

                        <section className="prose prose-neutral relative mt-8 max-w-none text-neutral-700">
                            <h2 className="sr-only">Overview</h2>
                            <p>{description}</p>

                            {/* Quick facts */}
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-neutral-100 bg-white p-4">
                                    <div className="text-xs text-neutral-500">Director</div>
                                    <div className="mt-1 text-sm font-medium text-neutral-900">
                                        {director ? (
                                            <Link href={`/persons/${director.id}`} className="hover:underline">
                                                {director.fullName}
                                            </Link>
                                        ) : (
                                            movieTyped.director ?? "Unknown"
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-neutral-100 bg-white p-4">
                                    <div className="text-xs text-neutral-500">Language</div>
                                    <div className="mt-1 text-sm font-medium text-neutral-900">{languageValue}</div>
                                </div>
                            </div>

                            {/* Cast */}
                            {actors.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm text-neutral-500 mb-3">Cast</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {actors.map((a) => (
                                            <Link
                                                key={a.id}
                                                href={`/persons/${a.id}`}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition"
                                            >
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
                                                    {a.imageUrl ? (
                                                        <Image src={a.imageUrl} alt={a.fullName} width={48} height={48} className="object-cover" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-neutral-200" />
                                                    )}
                                                </div>
                                                <div className="text-sm text-neutral-700 font-medium">{a.fullName}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
