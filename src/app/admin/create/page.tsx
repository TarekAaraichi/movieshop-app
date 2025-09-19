import AddButton from "@/components/AddButton";
import { createMovie } from "@/app/actions/movies";
import { requireAdmin } from "@/lib/requireAdmin";

/**
 * Renders the Create Movie page with a form for adding a new movie.
 * The form includes fields for title, release date, description, director, actors, image URL, runtime, price, stock, and genres.
 * On submission, the form calls the createMovie server action to persist the new movie.
 */
export default function CreateMoviePage() {
  // Note: this is a server component; call shared requireAdmin at render-time
  void requireAdmin("/admin/create");
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 p-8">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900">
          Create Movie
        </h1>
        <form action={createMovie} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Movie Title:
              <input
                name="title"
                type="text"
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Release Date:
              <input
                name="releaseDate"
                type="date"
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description:
              <textarea
                name="description"
                rows={4}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              ></textarea>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Director:
              <input
                name="director"
                type="text"
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Actors (comma‑separated):
              <input
                name="actors"
                type="text"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          {/* Inside your movie creation form */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image URL:
              <input
                name="imageUrl"
                type="url"
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Runtime (minutes):
              <input
                name="runtime"
                type="number"
                min={1}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price:
              <input
                name="price"
                type="number"
                step="0.01"
                min={0}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock:
              <input
                name="stock"
                type="number"
                min={0}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Genres (comma‑separated):
              <input
                name="genres"
                type="text"
                placeholder="Action, Drama, Sci‑Fi"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <AddButton />
        </form>
      </div>
    </div>
  );
}
