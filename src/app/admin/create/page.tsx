// app/movies/create/page.tsx
import prisma from "@/lib/prisma";
import { PersonRole } from "@prisma/client";
import AddButton from "./AddButton";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const movieCreateSchema = z.object({
  title: z.string().min(1),
  releaseDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid date" }),
  description: z.string().min(1),
  director: z.string().min(1),
  actors: z.string().optional().nullable(),
  imageUrl: z.string().url().optional(),
  runtime: z.preprocess((v) => (typeof v === 'string' ? parseInt(v, 10) : v), z.number().int().positive()),
  price: z.preprocess((v) => (typeof v === 'string' ? parseFloat(v) : v), z.number().nonnegative()),
  stock: z.preprocess((v) => (typeof v === 'string' ? parseInt(v, 10) : v), z.number().int().nonnegative()),
  genres: z.string().optional().nullable(),
});

async function createMovie(formData: FormData) {
  "use server";

  // Convert FormData to plain object to validate with Zod
  const raw = Object.fromEntries(formData.entries());
  const parsed = movieCreateSchema.parse(raw);

  const title = parsed.title;
  const releaseDate = parsed.releaseDate;
  const description = parsed.description;
  const directorName = parsed.director;
  const actorsInput = parsed.actors ?? "";
  const imageUrl = parsed.imageUrl ?? "";
  const runtime = Number(parsed.runtime);
  const price = Number(parsed.price);
  const stock = Number(parsed.stock);
  const genresInput = parsed.genres ?? null;

  // Upsert director
  const director = await prisma.person.upsert({
    where: { fullName: directorName.trim() },
    update: {},
    create: { fullName: directorName.trim() },
  });

  // Upsert actors
  const actorNames = actorsInput
    ? (actorsInput as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const actors = await Promise.all(
    actorNames.map((name) =>
      prisma.person.upsert({
        where: { fullName: name },
        update: {},
        create: { fullName: name },
      })
    )
  );

  // Upsert genres
  const genreNames =
    (genresInput as string | null)
      ?.split(",")
      .map((name) => name.trim())
      .filter(Boolean) ?? [];
  const genreRecords = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Create movie with all fields and relationships
  await prisma.movie.create({
    data: {
      title,
      description,
      releaseDate: new Date(releaseDate),
      imageUrl,
      runtime,
      price: price.toFixed(2),
      stock,
      people: {
        create: [
          { personId: director.id, role: PersonRole.DIRECTOR },
          ...actors.map((actor) => ({
            personId: actor.id,
            role: PersonRole.ACTOR,
          })),
        ],
      },
      genres: {
        create: genreRecords.map((g) => ({ genreId: g.id })),
      },
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

/**
 * Renders the Create Movie page with a form for adding a new movie.
 * The form includes fields for title, release date, description, director, actors, image URL, runtime, price, stock, and genres.
 * On submission, the form calls the createMovie server action to persist the new movie.
 */
export default function CreateMoviePage() {
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
