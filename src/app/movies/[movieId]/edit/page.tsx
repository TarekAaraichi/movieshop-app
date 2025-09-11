import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import SaveButton from "./SaveButton";
import { updateMovie } from "@/app/actions/movies";

// Component that renders the form
export default async function EditMoviePage({
  params: { movieId },
}: {
  params: { movieId: string };
}) {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 p-8">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900">
          Edit Movie
        </h1>
        <form action={updateMovie} className="space-y-4">
          {/* hidden field to identify which movie to update */}
          <input type="hidden" name="movieId" value={movie.id} />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Movie Title:
              <input
                name="title"
                type="text"
                defaultValue={movie.title}
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
                defaultValue={movie.releaseDate.toISOString().split("T")[0]}
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
                defaultValue={movie.description}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Director:
              <input
                name="director"
                type="text"
                defaultValue={directorName}
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
                defaultValue={actorNames}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image URL:
              <input
                name="imageUrl"
                type="url"
                defaultValue={movie.imageUrl}
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
                defaultValue={movie.runtime?.toString()}
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
                defaultValue={movie.price}
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
                defaultValue={movie.stock}
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
                defaultValue={genreNamesDefault}
                placeholder="Action, Drama, Sci‑Fi"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <SaveButton />
        </form>
      </div>
    </div>
  );
}
