// src/app/movies/[movieId]/page.tsx
import { prisma } from "@/lib";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AddToCartClientButton, Button } from "@/components";

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

  if (!movie || movie.isArchived) {
    return notFound();
  }

  // addToCart server action moved to src/app/actions/movies.ts

  const director = movie.people.find((p) => p.role === "DIRECTOR");
  const actors = movie.people.filter((p) => p.role === "ACTOR");

  // compute progress gradient class based on stock
  const progressGradientClass =
    movie.stock > 10
      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
      : movie.stock > 0
      ? "bg-gradient-to-r from-amber-500 to-orange-400"
      : "bg-gradient-to-r from-red-500 to-orange-500";

  return (
    <div
      className={
        "font-sans min-h-screen flex flex-col text-gray-200 " +
        // layered background: subtle radial highlight + deep linear base
        "bg-[radial-gradient(800px_400px_at_10%_10%,rgba(99,102,241,0.06),transparent),linear-gradient(180deg,#0f1724,#0b1220)]"
      }
    >
      <main className="flex-grow p-8 max-w-[1100px] w-full mx-auto">
        <div className="rounded-lg p-6 shadow-2xl transition-transform transform hover:-translate-y-1 bg-[linear-gradient(90deg,rgba(17,24,39,0.65),rgba(15,23,42,0.55))] border border-white/4 backdrop-blur-md saturate-110">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 min-w-0">
              <div className="w-full h-96 relative rounded-xl overflow-hidden shadow-xl border border-white/5">
                <Image
                  src={movie.imageUrl || "/file.svg"}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/60" />
              </div>
            </div>

            <div className="md:w-2/3 min-w-0 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                  <span className="text-gray-300">
                    Release:{" "}
                    <span className="font-medium text-gray-100">
                      {movie.releaseDate.toISOString().split("T")[0]}
                    </span>
                  </span>

                  {director && (
                    <span className="text-gray-300">
                      Director:{" "}
                      <Link
                        href={`/persons/${director.person.id}`}
                        className="text-teal-400 hover:underline font-medium"
                      >
                        {director.person.fullName}
                      </Link>
                    </span>
                  )}
                </div>

                {actors.length > 0 && (
                  <div className="text-sm text-gray-300 mb-3">
                    <span className="font-semibold text-gray-100">Actors:</span>{" "}
                    <span className="inline-flex flex-wrap gap-2">
                      {actors.map((a, i, arr) => (
                        <span key={a.person.id} className="mr-1">
                          <Link
                            href={`/persons/${a.person.id}`}
                            className="text-teal-300 hover:underline"
                          >
                            {a.person.fullName}
                          </Link>
                          {i < arr.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {movie.genres.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {movie.genres.map((g) => (
                      <span
                        key={g.genre.id}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-white/40 to-slate-300/30 text-white-800 border border-white/10"
                      >
                        {g.genre.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-gray-300 mt-2 leading-relaxed">
                  <span className="font-semibold text-gray-100">
                    Description:
                  </span>
                  <br />
                  {movie.description}
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-gray-100 font-medium mb-1">
                    Runtime: {Math.floor(Number(movie.runtime) / 60)}h {Number(movie.runtime) % 60}m
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-white font-bold text-xl drop-shadow-[0_6px_18px_rgba(59,130,246,0.12)]">
                      ${Number(movie.price).toFixed(2)}
                    </p>

                    <div className="text-sm">
                      <div className="text-gray-100 font-medium">
                        Left in Stock:{" "}
                        <span className="ml-1">{movie.stock}</span>
                      </div>

                      <div
                        className="w-48 h-2 mt-2 bg-white/6 rounded-full overflow-hidden"
                        aria-hidden
                      >
                        {/* inline style required: width is runtime-calculated from stock percentage */}
                        {/* eslint-disable-next-line */}
                        <div
                          className={`h-full rounded-full transition-all ${progressGradientClass}`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((movie.stock / 20) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <AddToCartClientButton
                    movieId={movie.id}
                    disabled={movie.isArchived || movie.stock <= 0}
                    // enhance button visually via props (if supported) otherwise rely on internal styling
                  />

                  <Button asChild size="sm" variant="ghost" className="transition-colors">
                    <Link
                      href="/movies"
                      className="text-sm text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md inline-flex items-center gap-2 bg-gradient-to-r from-white/40 to-slate-300/30 text-white-800 border border-white/10 transition-transform transition-colors duration-150 ease-out transform hover:-translate-y-1 hover:scale-105 active:translate-y-1 active:scale-95 hover:shadow-lg active:shadow-inner active:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60 focus-visible:ring-offset-2"
                    >
                      Back to catalog
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
