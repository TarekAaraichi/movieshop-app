import { AddButton } from "@/components";
import { createMovie } from "@/server/actions/moviesActions";
import { requireAdmin } from "@/lib/requireAdmin";

/**
 * Renders the Create Movie page with a form for adding a new movie.
 * The form includes fields for title, release date, description, director, actors, image URL, runtime, price, stock, and genres.
 * On submission, the form calls the createMovie server action to persist the new movie.
 */
export default async function CreateMoviePage() {
  // Note: this is a server component; call shared requireAdmin at render-time
  // redirect must match this page route
  await requireAdmin("/admin/movies/create");
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 p-6">
      <div className="mx-auto max-w-3xl bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Create Movie
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new movie to the catalog. Use the inline fields for a quicker
            workflow.
          </p>
        </header>

        <form action={createMovie} className="space-y-6">
          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label
              htmlFor="title"
              className="w-full sm:w-36 text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g., The Great Adventure"
              className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Release Date + Runtime (inline) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="releaseDate"
                className="w-full sm:w-36 text-sm font-medium text-gray-700"
              >
                Release
              </label>
              <input
                id="releaseDate"
                name="releaseDate"
                type="date"
                required
                className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="runtime"
                className="w-full sm:w-36 text-sm font-medium text-gray-700"
              >
                Runtime
              </label>
              <input
                id="runtime"
                name="runtime"
                type="number"
                min={1}
                required
                placeholder="minutes"
                className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Director + Actors (inline) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="director"
                className="w-full sm:w-36 text-sm font-medium text-gray-700"
              >
                Director
              </label>
              <input
                id="director"
                name="director"
                type="text"
                required
                placeholder="Director name"
                className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="actors"
                className="w-full sm:w-36 text-sm font-medium text-gray-700"
              >
                Actors
              </label>
              <input
                id="actors"
                name="actors"
                type="text"
                placeholder="Comma-separated"
                className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Price + Stock (inline) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="price"
                className="w-full sm:w-36 text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min={0}
                required
                placeholder="0.00"
                className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="stock"
                className="w-full sm:w-36 text-sm font-medium text-gray-700"
              >
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min={0}
                required
                className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label
              htmlFor="imageUrl"
              className="w-full sm:w-36 text-sm font-medium text-gray-700"
            >
              Poster
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              required
              placeholder="https://..."
              className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Genres */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label
              htmlFor="genres"
              className="w-full sm:w-36 text-sm font-medium text-gray-700"
            >
              Genres
            </label>
            <input
              id="genres"
              name="genres"
              type="text"
              placeholder="Action, Drama, Sci‑Fi"
              className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="description"
                className="w-36 text-sm font-medium text-gray-700 hidden sm:block"
              >
                Description
              </label>
              <span className="text-sm font-medium text-gray-700 sm:hidden">
                Description
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              placeholder="A short synopsis..."
              className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <AddButton />
          </div>
        </form>
      </div>
    </div>
  );
}
