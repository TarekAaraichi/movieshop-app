/**
 * Admin dashboard (ensured)
 * Server-rendered admin area index; requires admin guard.
 */

import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { AutoSubmitSelect } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/requireAdmin";
import {
  archiveMovie,
  deleteMovie,
  unarchiveMovie,
} from "@/server/actions/moviesActions";
import { deletePerson } from "@/server/actions/personsActions";
import { deleteUser, setUserRole } from "@/server/actions/usersActions";

type PersonWithMovies = {
  id: string;
  imageUrl: string | null;
  fullName: string;
  bio: string | null;
  movies: Array<{
    role: import("@prisma/client").PersonRole;
    movie: { title: string };
  }>;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { q?: string; tab?: string; genre?: string; role?: string };
}) {
  const q = searchParams.q ?? "";
  const tab = (searchParams.tab ?? "movies") as string;

  const { user: adminUser } = await requireAdmin("/admin");

  const moviesPromise = prisma.movie.findMany({
    where: {
      AND: [
        q
          ? {
              title: { contains: q, mode: "insensitive" },
            }
          : {},
        searchParams.genre
          ? {
              genres: {
                some: { genreId: { equals: searchParams.genre as string } },
              },
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      genres: { include: { genre: true } },
      people: { include: { person: true } },
    },
  });

  const personsPromise = prisma.person.findMany({
    where: {
      AND: [
        q
          ? {
              fullName: { contains: q, mode: "insensitive" },
            }
          : {},
        tab === "persons" && searchParams.role
          ? {
              movies: {
                some: {
                  role: {
                    equals:
                      searchParams.role as unknown as import("@prisma/client").PersonRole,
                  },
                },
              },
            }
          : {},
      ],
    },
    orderBy: { fullName: "asc" },
    include: { movies: { include: { movie: true } } },
  });
  const personsPromiseTyped = personsPromise as Promise<
    Array<PersonWithMovies>
  >;

  const usersPromise = prisma.user.findMany({
    where:
      tab === "users" && searchParams.role
        ? { role: { equals: searchParams.role as string } }
        : undefined,
    orderBy: { email: "asc" },
  });

  // fetch actual filter options from DB
  const genresPromise = prisma.genre.findMany({ orderBy: { name: "asc" } });
  // person roles are enum values referenced on MoviePerson.role; gather distinct ones
  const personRolesPromise = prisma.moviePerson.findMany({
    select: { role: true },
    distinct: ["role"],
  });
  // user roles are stored on User.role — gather distinct values
  const userRolesPromise = prisma.user.findMany({
    select: { role: true },
    distinct: ["role"],
  });

  const [movies, personsRaw, users, genres, personRolesRaw, userRolesRaw] =
    await Promise.all([
      moviesPromise,
      personsPromiseTyped,
      usersPromise,
      genresPromise,
      personRolesPromise,
      userRolesPromise,
    ]);

  const persons = personsRaw as Array<PersonWithMovies>;

  const personRoles = Array.from(
    new Set(personRolesRaw.map((r) => r.role)),
  ).filter(Boolean);

  const userRoles = Array.from(new Set(userRolesRaw.map((r) => r.role))).filter(
    Boolean,
  );

  // compute order reference counts per movie so we can control permanent delete UI
  const orderCountsArr = await Promise.all(
    movies.map((m) => prisma.orderItem.count({ where: { movieId: m.id } })),
  );
  const orderCounts = new Map<string, number>(
    movies.map((movie, index) => [movie.id, orderCountsArr[index]]),
  );

  const activeMoviesCount = movies.filter((m) => !m.isArchived).length;
  const stats = [
    {
      label: "Movies",
      value: movies.length,
      sublabel: `${activeMoviesCount} active`,
      accent: "from-indigo-500 to-sky-500",
    },
    {
      label: "People",
      value: persons.length,
      sublabel: `${personRoles.length} roles`,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Users",
      value: users.length,
      sublabel: `${userRoles.length} roles`,
      accent: "from-purple-500 to-pink-500",
    },
    {
      label: "Genres",
      value: genres.length,
      sublabel: "Library",
      accent: "from-amber-500 to-orange-500",
    },
  ];

  const tabBaseClasses = "rounded-full px-4 py-2 transition";
  const tabActiveClasses =
    "bg-indigo-100 text-indigo-700 shadow-sm dark:bg-white/15 dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.15)]";
  const tabInactiveClasses =
    "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100";

  return (
    <PageWrapper>
      <div className="min-h-screen space-y-8 bg-transparent text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
        <header className="max-w-7xl mx-auto">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_rgba(255,255,255,0.95)_60%)] p-6 sm:p-8 shadow-lg backdrop-blur-sm dark:border-gray-800/70 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:bg-gray-900/70 dark:text-indigo-300">
                  Control Center
                </span>
                <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                {adminUser?.name && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-indigo-100/80">
                    Welcome back, {adminUser.name}. Manage content, people, and
                    users from one place.
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800/60 dark:bg-gray-900/70 dark:backdrop-blur"
              >
                <div
                  className={`inline-flex items-center rounded-full bg-gradient-to-r ${stat.accent} px-3 py-1 text-xs font-semibold text-white/90`}
                >
                  {stat.label}
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    total
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {stat.sublabel}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Card className="max-w-7xl mx-auto border border-gray-200 bg-white shadow-sm dark:border-gray-900/70 dark:bg-gray-950/70 dark:backdrop-blur">
          {/* tabs + search row */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-sm font-medium text-gray-600 dark:border-gray-800/70 dark:bg-gray-900/60 dark:text-gray-400">
                <Link
                  href="/admin?tab=movies"
                  className={`${tabBaseClasses} ${
                    tab === "movies" ? tabActiveClasses : tabInactiveClasses
                  }`}
                >
                  Movies
                </Link>
                <Link
                  href="/admin?tab=persons"
                  className={`${tabBaseClasses} ${
                    tab === "persons" ? tabActiveClasses : tabInactiveClasses
                  }`}
                >
                  Persons
                </Link>
                <Link
                  href="/admin?tab=users"
                  className={`${tabBaseClasses} ${
                    tab === "users" ? tabActiveClasses : tabInactiveClasses
                  }`}
                >
                  Users
                </Link>
              </div>

              <form
                method="GET"
                className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3 md:flex-row md:items-center md:gap-3 md:p-2 dark:border-gray-800/70 dark:bg-gray-900/50"
              >
                <input type="hidden" name="tab" value={tab} />
                <div className="relative w-full md:w-auto">
                  <input
                    name="q"
                    type="search"
                    defaultValue={q}
                    placeholder={
                      tab === "movies"
                        ? "Search movies..."
                        : tab === "persons"
                          ? "Search people..."
                          : "Search users..."
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/70 dark:border-gray-800/70 dark:bg-gray-950/70 dark:text-gray-100"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400 dark:text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {tab === "movies" && (
                  <AutoSubmitSelect
                    name="genre"
                    value={searchParams.genre as string}
                    ariaLabel="Filter by genre"
                    options={genres.map((g) => ({
                      value: g.id,
                      label: g.name,
                    }))}
                    className="min-w-[160px] border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-100"
                  />
                )}

                {tab === "persons" && (
                  <AutoSubmitSelect
                    name="role"
                    value={searchParams.role as string}
                    ariaLabel="Filter by person role"
                    options={personRoles.map((r) => ({ value: r, label: r }))}
                    className="min-w-[160px] border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-100"
                  />
                )}

                {tab === "users" && (
                  <AutoSubmitSelect
                    name="role"
                    value={searchParams.role as string}
                    ariaLabel="Filter by user role"
                    options={userRoles.map((r) => ({ value: r, label: r }))}
                    className="min-w-[160px] border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-100"
                  />
                )}
              </form>
            </div>
          </div>

          {/* content */}
          <div className="p-4">
            <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
              {tab === "movies" && (
                <Link
                  href="/admin/movies/create"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-indigo-400/40 dark:bg-indigo-400/20 dark:text-indigo-50 dark:hover:bg-indigo-400/30 dark:focus:ring-indigo-300/60"
                >
                  + New Movie
                </Link>
              )}
              {tab === "persons" && (
                <Link
                  href="/admin/persons/create"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-indigo-400/40 dark:bg-indigo-400/20 dark:text-indigo-50 dark:hover:bg-indigo-400/30 dark:focus:ring-indigo-300/60"
                >
                  + New Person
                </Link>
              )}
              {tab === "users" && (
                <Link
                  href="/admin/users/create"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-indigo-400/40 dark:bg-indigo-400/20 dark:text-indigo-50 dark:hover:bg-indigo-400/30 dark:focus:ring-indigo-300/60"
                >
                  + New User
                </Link>
              )}
            </div>
            {tab === "movies" && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {movies.map((movie) => (
                  <Card
                    key={movie.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg dark:border-gray-900/70 dark:bg-gray-950/70"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {movie.title}
                        </h3>
                        {movie.isArchived && (
                          <span className="whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {movie.releaseDate?.getFullYear() ?? "—"} &middot;{" "}
                        {movie.genres.map((g) => g.genre.name).join(", ") ||
                          "—"}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-sm">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                          {movie.price != null
                            ? `SEK ${String(movie.price)}`
                            : "—"}
                        </span>
                        <span className="text-gray-400 dark:text-gray-600">
                          |
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Stock {movie.stock ?? "—"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800/70">
                      <Link
                        href={`/admin/movies/${movie.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-white"
                      >
                        Edit
                      </Link>

                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                        {!movie.isArchived ? (
                          <form action={archiveMovie}>
                            <input
                              type="hidden"
                              name="movieId"
                              value={movie.id}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 transition hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/10"
                            >
                              Archive
                            </button>
                          </form>
                        ) : (
                          <form action={unarchiveMovie}>
                            <input
                              type="hidden"
                              name="movieId"
                              value={movie.id}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/10"
                            >
                              Unarchive
                            </button>
                          </form>
                        )}

                        <form action={deleteMovie}>
                          <input
                            type="hidden"
                            name="movieId"
                            value={movie.id}
                          />
                          <button
                            type="submit"
                            disabled={(orderCounts.get(movie.id) ?? 0) > 0}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/10 dark:disabled:border-gray-700 dark:disabled:bg-transparent dark:disabled:text-gray-500"
                            title={
                              (orderCounts.get(movie.id) ?? 0) > 0
                                ? "Cannot delete: movie has associated orders"
                                : "Permanently delete movie"
                            }
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {tab === "persons" && (
              <div className="grid grid-cols-1 gap-4">
                {persons.map((person) => {
                  const roles =
                    Array.from(
                      new Set((person.movies || []).map((m) => m.role)),
                    ).join(", ") || "Not assigned";
                  return (
                    <div
                      key={person.id}
                      className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-500/40 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between dark:border-gray-900/70 dark:bg-gray-950/70"
                    >
                      <div className="flex items-center gap-4">
                        {person.imageUrl ? (
                          <Image
                            src={person.imageUrl}
                            alt={person.fullName}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-sm font-semibold uppercase text-indigo-700 dark:border-indigo-400/40 dark:bg-indigo-400/10 dark:text-indigo-200">
                            {person.fullName
                              .split(" ")
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                        )}
                        <div>
                          <div className="text-base font-semibold text-gray-900 dark:text-white">
                            {person.fullName}
                          </div>
                          <div className="mt-1 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-500">
                            {roles}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                        <Link
                          href={`/admin/persons/${person.id}/edit`}
                          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-200 dark:hover:bg-indigo-400/10"
                        >
                          Edit
                        </Link>
                        <form action={deletePerson}>
                          <input
                            type="hidden"
                            name="personId"
                            value={person.id}
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/10"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "users" && (
              <div className="grid grid-cols-1 gap-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-500/40 hover:shadow-lg md:flex-row md:items-center md:justify-between dark:border-gray-900/70 dark:bg-gray-950/70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-semibold uppercase text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200">
                        {u.name
                          ? u.name
                              .split(" ")
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join("")
                          : u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {u.name ?? "—"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {u.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                      <span
                        className={`rounded-full border px-3 py-1 ${
                          u.role === "admin"
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-200"
                            : "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-600/40 dark:bg-gray-700/40 dark:text-gray-300"
                        }`}
                      >
                        {u.role ?? "user"}
                      </span>

                      <form action={setUserRole} className="inline-flex">
                        <input type="hidden" name="userId" value={u.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={u.role === "admin" ? "user" : "admin"}
                        />
                        <button
                          type="submit"
                          className={`rounded-full border px-3 py-1 transition ${
                            u.role === "admin"
                              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/10"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/10"
                          }`}
                          title={
                            u.role === "admin" ? "Revoke admin" : "Grant admin"
                          }
                        >
                          {u.role === "admin" ? "Revoke" : "Grant"}
                        </button>
                      </form>

                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/10"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
