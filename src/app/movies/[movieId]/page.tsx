// src/app/movies/[movieId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartClientButton from "./AddToCartClientButton";

export default async function MovieDetailPage({
  params: { movieId },
}: {
  params: { movieId: string };
}) {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-gray-50 p-8 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <div className="w-full h-80 relative">
              <Image
                src={movie.imageUrl || "https://via.placeholder.com/400x300"}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">
                {movie.title}
              </h1>
              <p className="text-gray-500 mb-2">
                Release date: {movie.releaseDate.toISOString().split("T")[0]}
              </p>
              {director && (
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Director:</span>{" "}
                  {director.person.fullName}
                </p>
              )}
              {actors.length > 0 && (
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Actors:</span>{" "}
                  {actors.map((a) => a.person.fullName).join(", ")}
                </p>
              )}
              {movie.genres.length > 0 && (
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Genre:</span>{" "}
                  {movie.genres.map((g) => g.genre.name).join(", ")}
                </p>
              )}
              <p className="text-gray-700 mt-4">{movie.description}</p>
            </div>
            <div className="mt-6">
              <p className="text-gray-800 font-medium mb-2">
                Runtime: {movie.runtime} min
              </p>
              <p className="text-gray-800 font-medium mb-2">
                Price: {Number(movie.price).toFixed(2)}$
              </p>
              <p className="text-gray-800 font-medium mb-4">
                Stock: {movie.stock}
              </p>
              <AddToCartClientButton movieId={movie.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
