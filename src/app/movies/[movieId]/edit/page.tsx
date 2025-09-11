import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import SaveButton from './SaveButton';

// Server action to handle the update
async function updateMovie(formData: FormData) {
  'use server';

  const movieId = formData.get('movieId') as string; // hidden field to know which movie to update
  const title = formData.get('title') as string;
  const releaseDate = formData.get('releaseDate') as string;
  const description = formData.get('description') as string;
  const directorName = formData.get('director') as string;
  const actorsInput = formData.get('actors') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const runtime = parseInt(formData.get('runtime') as string, 10);
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const genresInput = formData.get('genres') as string | null;

  // Validation omitted for brevity

  // Upsert director
  const director = await prisma.person.upsert({
    where: { fullName: directorName.trim() },
    update: {},
    create: { fullName: directorName.trim() },
  });

  // Upsert actors
  const actorNames = actorsInput
    ? actorsInput.split(',').map((n) => n.trim()).filter(Boolean)
    : [];
  const actors = await Promise.all(
    actorNames.map((name) =>
      prisma.person.upsert({
        where: { fullName: name },
        update: {},
        create: { fullName: name },
      }),
    ),
  );

  // Upsert genres
  const genreNames = genresInput
    ?.split(',')
    .map((n) => n.trim())
    .filter(Boolean) ?? [];
  const genreRecords = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  // Update the movie and replace its relations
    // Update the movie and replace its relations
  await prisma.movie.update({
    where: { id: movieId },
    data: {
      title,
      description,
      releaseDate: new Date(releaseDate),
      imageUrl,
      runtime,
      price: price.toFixed(2),
      stock,
      people: {
        deleteMany: {}, // remove old director/actor links
        create: [
          { personId: director.id, role: 'DIRECTOR' },
          ...actors.map((actor) => ({
            personId: actor.id,
            role: 'ACTOR',
          })),
        ],
      },
      genres: {
        deleteMany: {}, // remove old genre links
        create: genreRecords.map((g) => ({ genreId: g.id })),
      },
    },
  });

  revalidatePath('/admin');
  redirect('/admin');
}

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
    movie.people.find((p) => p.role === 'DIRECTOR')?.person.fullName ?? '';
  const actorNames = movie.people
    .filter((p) => p.role === 'ACTOR')
    .map((p) => p.person.fullName)
    .join(', ');

  // Pre‑fill genres as a comma-separated string
  const genreNamesDefault = movie.genres
    .map((mg) => mg.genre.name)
    .join(', ');

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
                defaultValue={movie.releaseDate.toISOString().split('T')[0]}
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

