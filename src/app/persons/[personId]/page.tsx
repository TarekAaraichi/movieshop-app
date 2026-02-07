/**
 * Person detail page (ensured)
 * Server-rendered page that shows an actor/person details and associated movies.
 */

// src/app/persons/[personId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MovieCard } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";

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
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
              people: { include: { person: true } },
            },
          },
        },
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
    <PageWrapper>
      <div className="w-full mx-auto flex items-start gap-2 p-1 rounded-2xl">
        <aside className="shrink-0 p-2">
          <div className="w-64 min-w-66 h-64 rounded-full overflow-hidden shadow-xl relative bg-white dark:bg-neutral-900">
            <Image
              src={person.imageUrl ?? "/file.svg"}
              alt={person.fullName}
              fill
              sizes="(max-width: 768px) 100vw, 264px"
              className="object-cover"
              priority
              unoptimized
            />
          </div>
          <div className="mt-4 w-64 min-w-66">
            <Link
              href="/persons"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white dark:bg-linear-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 text-gray-800 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 px-4 py-3 text-sm font-medium shadow-lg hover:bg-gray-50 dark:hover:bg-linear-to-br dark:hover:from-neutral-800 dark:hover:to-slate-600 active:scale-95 transition-all duration-150"
            >
              Go to People
            </Link>
            <Link
              href="/movies"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white dark:bg-linear-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 text-gray-800 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 px-4 py-3 text-sm font-medium shadow-lg hover:bg-gray-50 dark:hover:bg-linear-to-br dark:hover:from-neutral-800 dark:hover:to-slate-600 active:scale-95 transition-all duration-150"
            >
              Go to Movies
            </Link>
          </div>
        </aside>
        <main className="w-full mx-auto grow p-2">
          <section className="flex flex-col gap-6 items-start p-5 rounded-[14px] bg-white dark:bg-linear-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 border border-gray-200 dark:border-neutral-700 shadow-2xl backdrop-blur-sm">
            <div className="flex-1 min-w-0">
              <h1 className="text-[32px] font-extrabold m-0 flex items-center gap-3 bg-clip-text text-transparent bg-linear-to-r from-emerald-500 to-blue-500 dark:from-emerald-400 dark:to-blue-400">
                {person.fullName}
                {rolesDisplay ? (
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-linear-to-r from-white/40 to-slate-300/30 text-gray-700 dark:text-gray/80 border border-gray-200 dark:border-neutral-700 px-3 py-1 text-xs font-medium">
                    {rolesDisplay}
                  </span>
                ) : null}
              </h1>

              {person.bio ? (
                <p className="text-gray-700 dark:text-neutral-300 mt-2 leading-relaxed">
                  {person.bio}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-neutral-500 mt-2">
                  No bio available.
                </p>
              )}
            </div>

            <div className="w-full">
              <h2 className="mt-5 mb-2 text-sm text-gray-500 dark:text-neutral-400">
                Known For
              </h2>

              {movies.length === 0 ? (
                <p className="text-gray-500 dark:text-slate-400">
                  No movies found for this person.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 p-3">
                  {movies.map((mp) => (
                    <MovieCard key={mp.movie.id} movie={mp.movie} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </PageWrapper>
  );
}
