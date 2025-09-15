// src/app/movies/[movieId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartClientButton from "./AddToCartClientButton";

export default async function MovieDetailPage({
  params,
}: {
  params: { movieId: string } | Promise<{ movieId: string }>;
}) {
  const p = await params;
  const movieId = p.movieId;
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      people: {
        include: { person: true },
      },
      genres: {
        include: { genre: true },
      },
    },
  });

  if (!movie) {
    return notFound();
  }

  // addToCart server action moved to src/app/actions/movies.ts

  const director = movie.people.find((p) => p.role === "DIRECTOR");
  const actors = movie.people.filter((p) => p.role === "ACTOR");

  return (
    <div className="font-sans min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      <main className="flex-grow p-8 max-w-[1100px] w-full mx-auto">
        <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 min-w-0">
              <div className="w-full h-96 relative rounded-lg overflow-hidden shadow-md">
                <Image
                  src={movie.imageUrl || "/file.svg"}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-2/3 min-w-0 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                  {movie.title}
                </h1>
                <p className="text-gray-300 mb-2">
                  Release date: {movie.releaseDate.toISOString().split("T")[0]}
                </p>
                {director && (
                  <p className="text-gray-300 mb-2">
                    <span className="font-semibold text-gray-100">
                      Director:
                    </span>{" "}
                    <Link
                      href={`/persons/${director.person.id}`}
                      className="text-teal-500 hover:underline"
                    >
                      {director.person.fullName}
                    </Link>
                  </p>
                )}
                {actors.length > 0 && (
                  <p className="text-gray-300 mb-2">
                    <span className="font-semibold text-gray-100">Actors:</span>{" "}
                    {actors.map((a, i, arr) => (
                      <span key={a.person.id}>
                        <Link
                          href={`/persons/${a.person.id}`}
                          className="text-teal-300 hover:underline"
                        >
                          {a.person.fullName}
                        </Link>
                        {i < arr.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                )}
                {movie.genres.length > 0 && (
                  <p className="text-gray-300 mb-2">
                    <span className="font-semibold text-gray-100">Genre:</span>{" "}
                    {movie.genres.map((g) => g.genre.name).join(", ")}
                  </p>
                )}
                <p className="text-gray-300 mt-4">
                  <span className="font-semibold text-gray-100">Description:</span>
                  <br />
                  {movie.description}
                </p>
              </div>
              <div className="mt-6">
                <p className="text-gray-100 font-medium mb-2">
                  Runtime: {movie.runtime} min
                </p>
                <p className="text-green-400 font-semibold mb-2">
                  ${Number(movie.price).toFixed(2)}
                </p>
                <p className="text-gray-100 font-medium mb-4">
                  Stock: {movie.stock}
                </p>
                <AddToCartClientButton movieId={movie.id} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
