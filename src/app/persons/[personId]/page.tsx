// src/app/persons/[personId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function PersonPage({
  params,
}: {
  params: { personId: string } | Promise<{ personId: string }>;
}) {
  const p = await params;
  const personId = p.personId;
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      movies: {
        include: { movie: true },
      },
    },
  });

  if (!person) return notFound();

  /*
    Optional auth scaffold (commented out):
    If person pages should be private, uncomment and adapt this check.
    Example:
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/persons/${personId}`)}`);
  */

  const movies = person.movies ?? [];
  // compute unique roles (e.g. DIRECTOR, ACTOR) from MoviePerson entries
  const roles = Array.from(new Set(movies.map((m) => m.role))).filter(Boolean);
  const prettyRole = (r: string) => {
    if (r === "DIRECTOR") return "Director";
    if (r === "ACTOR") return "Actor";
    return r;
  };
  const rolesDisplay = roles.length ? roles.map(prettyRole).join(", ") : null;

  return (
    <div className="font-sans min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      <main className="flex-grow p-8 max-w-[1100px] w-full mx-auto">
        <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 min-w-0 flex items-start">
              <div className="w-48 h-48 relative rounded-full overflow-hidden shadow-md">
                <Image
                  src={person.imageUrl ?? "/file.svg"}
                  alt={person.fullName}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-2/3 min-w-0">
              <h1 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                {person.fullName}
                {rolesDisplay ? (
                  <span className="text-lg font-medium text-gray-300 ml-3">{`(${rolesDisplay})`}</span>
                ) : null}
              </h1>
              {person.bio ? (
                <p className="text-gray-300 mb-4">{person.bio}</p>
              ) : (
                <p className="text-gray-500 mb-4">No bio available.</p>
              )}

              <h2 className="text-2xl font-semibold mt-4 mb-3">Movies</h2>
              {movies.length === 0 ? (
                <p className="text-gray-400">
                  No movies found for this person.
                </p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {movies.map((mp) => (
                    <li
                      key={`${mp.movieId}-${mp.role}`}
                      className="bg-gray-800 rounded-md p-3"
                    >
                      <Link
                        href={`/movies/${mp.movie.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-16 h-24 relative rounded overflow-hidden bg-gray-700">
                          <Image
                            src={mp.movie.imageUrl ?? "/file.svg"}
                            alt={mp.movie.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 80px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-lg font-medium text-gray-100">
                            {mp.movie.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            {mp.role} •{" "}
                            {mp.movie.releaseDate
                              ? new Date(
                                  mp.movie.releaseDate as unknown as string
                                ).getFullYear()
                              : ""}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
