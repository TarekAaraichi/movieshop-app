/**
 * Admin: Edit movie (duplicate)
 * Server page for editing movie details (admin only).
 */

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { notFound } from "next/navigation";
import { SaveButton, Button as BackButton } from "@/components";
import { updateMovie } from "@/server/actions/moviesActions";

// Component that renders the form
export default async function EditMoviePage({
  params: { movieId },
}: {
  params: { movieId: string };
}) {
  await requireAdmin(`/admin/movies/${movieId}/edit`);
  // Fetch the movie including its related people and genres
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      people: { include: { person: true } },
      genres: { include: { genre: true } },
    },
  });

  if (!movie) {
    return notFound();
  }

  // Pre‑fill director and actor names
  const directorName =
    movie.people.find((p) => p.role === "DIRECTOR")?.person.fullName ?? "";
  const actorNames = movie.people
    .filter((p) => p.role === "ACTOR")
    .map((p) => p.person.fullName)
    .join(", ");

  // Pre‑fill genres as a comma-separated string
  const genreNamesDefault = movie.genres.map((mg) => mg.genre.name).join(", ");

  return (
    <div>
      <div className="bg-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto border border-gray-800">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100">
              Edit Movie
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Update movie details inline. Changes are applied after saving.
            </p>
          </div>
        </header>

        <form action={updateMovie} className="space-y-4">
          {/* hidden field to identify which movie to update */}
          <input type="hidden" name="movieId" value={movie.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="title"
                className="w-28 text-sm font-medium text-gray-300"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={movie.title}
                required
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                placeholder="Movie title"
              />
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="releaseDate"
                className="w-28 text-sm font-medium text-gray-300"
              >
                Release
              </label>
              <input
                id="releaseDate"
                name="releaseDate"
                type="date"
                defaultValue={movie.releaseDate.toISOString().split("T")[0]}
                required
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
              />
            </div>

            <div className="flex items-start gap-4 md:col-span-2">
              <label
                htmlFor="description"
                className="w-28 text-sm font-medium text-gray-300 pt-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={movie.description}
                required
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                placeholder="Short synopsis..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="director"
                className="w-28 text-sm font-medium text-gray-300"
              >
                Director
              </label>
              <input
                id="director"
                name="director"
                type="text"
                defaultValue={directorName}
                required
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                placeholder="Full name"
              />
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="actors"
                className="w-28 text-sm font-medium text-gray-300"
              >
                Actors
              </label>
              <input
                id="actors"
                name="actors"
                type="text"
                defaultValue={actorNames}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                placeholder="Comma-separated list"
              />
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="imageUrl"
                className="w-28 text-sm font-medium text-gray-300"
              >
                Image
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={movie.imageUrl ?? ""}
                required
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="runtime"
                className="w-28 text-sm font-medium text-gray-300"
              >
                Runtime
              </label>
              <input
                id="runtime"
                name="runtime"
                type="number"
                min={1}
                defaultValue={movie.runtime?.toString()}
                required
                className="w-36 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                placeholder="minutes"
              />
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="price"
                className="w-28 text-sm font-medium text-gray-300"
              >
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min={0}
                defaultValue={String(movie.price ?? "")}
                required
                className="w-36 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="stock"
                className="w-28 text-sm font-medium text-gray-300"
              >
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min={0}
                defaultValue={movie.stock}
                required
                className="w-36 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                placeholder="qty"
              />
            </div>

            <div className="flex items-start gap-4 md:col-span-2">
              <label
                htmlFor="genres"
                className="w-28 text-sm font-medium text-gray-300 pt-2"
              >
                Genres
              </label>
              <input
                id="genres"
                name="genres"
                type="text"
                defaultValue={genreNamesDefault}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                placeholder="Action, Drama, Sci‑Fi"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700 flex items-center justify-end gap-3">
            <SaveButton />
          </div>
        </form>
      </div>
    </div>
  );
}
