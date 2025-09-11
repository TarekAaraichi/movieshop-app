// src/app/movies/page.tsx
import prisma from '@/lib/prisma';
import Link from 'next/link';

interface MoviesPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const query = searchParams.q ?? '';

  // Fetch movies, optionally filtering by title
  const movies = await prisma.movie.findMany({
    where: query
      ? {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        }
      : undefined,
    orderBy: { releaseDate: 'desc' },
    include: {
      people: {
        include: { person: true },
      },
      genres: {
        include: { genre: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-100">Movies List</h1>

        {/* Simple search form */}
        <form method="GET" className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <input
              name="q"
              type="search"
              placeholder="Search by title...🔍"
              defaultValue={query}
              className="p-2 w-64 rounded-lg border border-gray-500 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            />
            <button
              type="submit"
              className="ml-3 px-3 py-2 rounded-lg bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Search"
            >
              Search
            </button>
          </div>
          <div>
            <select
              name="genre"
              className="p-2 rounded-lg border border-gray-500 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              defaultValue=""
            >
              <option value="" disabled>
            Filter by genre
              </option>
              <option value="Action">Action</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
            </select>
          </div>
        </form>

        {/* Movies grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => {
            const director = movie.people.find((p) => p.role === 'DIRECTOR');
            return (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="block bg-gray-800 rounded-md shadow hover:bg-gray-700 transition"
              >
                <div>
                  <img
                    src={movie.imageUrl}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded-t-md"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-teal-400">{movie.title}</h2>
                    <p className="text-gray-400">Genre: {movie.genres.map((g) => g.genre.name).join(', ')}</p>
                    <p className="text-gray-400">Runtime: {movie.runtime} min</p>
                    <p className="text-gray-400">Price: {Number(movie.price).toFixed(2)}$</p>
                    <p className="text-gray-400">
                      Actors:{' '}
                      {movie.people
                        .filter((p) => p.role === 'ACTOR')
                        .map((p) => (
                          <a
                            key={p.person.id}
                            href={`/persons/${p.person.id}`}
                            className="text-teal-500 hover:underline"
                          >
                            {p.person.fullName}
                          </a>
                        ))
                        .reduce((prev, curr) =>
                          prev === null ? [curr] : [...prev, ', ', curr], null
                        )}
                    </p>
                    {director && (
                      <p className="text-gray-500">
                        Director: {director.person.fullName}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
          {movies.length === 0 && (
            <p className="text-gray-400 col-span-full text-center">No movies found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
