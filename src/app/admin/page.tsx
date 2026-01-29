/**
 * Admin dashboard (ensured)
 * Server-rendered admin area index; requires admin guard.
 */

import prisma from "@/lib/prisma";
import Link from "next/link";
import { AutoSubmitSelect } from "@/components";
import {
  archiveMovie,
  unarchiveMovie,
  deleteMovie,
} from "@/server/actions/moviesActions";
import { deletePerson } from "@/server/actions/personsActions";
import { deleteUser, setUserRole } from "@/server/actions/usersActions";
import { requireAdmin } from "@/lib/requireAdmin";
import Image from "next/image";
import { Card } from "@/components";

// AdminPage server component
export default async function AdminPage({
  searchParams,
}: {
  // searchParams may contain optional q, tab, genre and role from URL query
  searchParams: { q?: string; tab?: string; genre?: string; role?: string };
}) {
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
        // genre filter: if searchParams.genre present, require a genre with that id
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
  const orderCounts = new Map(movies.map((m, i) => [m.id, orderCountsArr[i]]));

  // server actions are centralized under src/app/actions/*

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Admin Dashboard
            </h1>
            {adminUser?.name && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {adminUser.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tab === "movies" && (
              <Link
                href="/admin/movies/create"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition"
              >
                + New Movie
              </Link>
            )}
            {tab === "persons" && (
              <Link
                href="/admin/persons/create"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition"
              >
                + New Person
              </Link>
            )}
            {tab === "users" && (
              <Link
                href="/admin/users/create"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition"
              >
                + New User
              </Link>
            )}
          </div>
        </div>
      </header>

      <Card className="max-w-7xl mx-auto">
        {/* tabs + search row */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-100 dark:bg-gray-800">
              <Link
                href="/admin?tab=movies"
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  tab === "movies"
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Movies
              </Link>
              <Link
                href="/admin?tab=persons"
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  tab === "persons"
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Persons
              </Link>
              <Link
                href="/admin?tab=users"
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  tab === "users"
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Users
              </Link>
            </div>

            <form method="GET" className="flex items-center gap-3">
              <input type="hidden" name="tab" value={tab} />
              <div className="relative">
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
                  className="pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                  options={genres.map((g) => ({ value: g.id, label: g.name }))}
                  className="min-w-[160px]"
                />
              )}

              {tab === "persons" && (
                <AutoSubmitSelect
                  name="role"
                  value={searchParams.role as string}
                  ariaLabel="Filter by person role"
                  options={personRoles.map((r) => ({ value: r, label: r }))}
                  className="min-w-[160px]"
                />
              )}

              {tab === "users" && (
                <AutoSubmitSelect
                  name="role"
                  value={searchParams.role as string}
                  ariaLabel="Filter by user role"
                  options={userRoles.map((r) => ({ value: r, label: r }))}
                  className="min-w-[160px]"
                />
              )}
            </form>
          </div>
        </div>

        {/* content */}
        <div className="p-4">
          {tab === "movies" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <Card
                  key={movie.id}
                  className="flex flex-col justify-between p-4 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {movie.title}
                      </h3>
                      {movie.isArchived && (
                        <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {movie.releaseDate?.getFullYear() ?? "—"} &middot;{" "}
                      {movie.genres.map((g) => g.genre.name).join(", ") || "—"}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {movie.price != null
                          ? `SEK ${String(movie.price)}`
                          : "—"}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">
                        |
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Stock: {movie.stock ?? "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <Link
                      href={`/admin/movies/${movie.id}/edit`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Edit
                    </Link>

                    <div className="flex items-center gap-2">
                      {!movie.isArchived ? (
                        <form action={archiveMovie}>
                          <input
                            type="hidden"
                            name="movieId"
                            value={movie.id}
                          />
                          <button
                            type="submit"
                            className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
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
                            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Unarchive
                          </button>
                        </form>
                      )}

                      <form action={deleteMovie}>
                        <input type="hidden" name="movieId" value={movie.id} />
                        <button
                          type="submit"
                          disabled={(orderCounts.get(movie.id) ?? 0) > 0}
                          className="text-sm font-medium text-red-600 dark:text-red-500 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
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
            <div className="overflow-x-auto">
              <ul className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {persons.map((person) => {
                  const roles =
                    Array.from(
                      new Set((person.movies || []).map((m) => m.role)),
                    ).join(", ") || "Not assigned";
                  return (
                    <li
                      key={person.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-4">
                        {person.imageUrl ? (
                          <Image
                            src={person.imageUrl}
                            alt={person.fullName}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-semibold">
                            {person.fullName
                              .split(" ")
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {person.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {roles}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/persons/${person.id}/edit`}
                          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
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
                            className="text-sm font-medium text-red-600 dark:text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {tab === "users" && (
            <div className="overflow-x-auto">
              <ul className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-emerald-500 dark:text-emerald-400 font-semibold">
                        {u.name
                          ? u.name
                              .split(" ")
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join("")
                          : u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {u.name ?? "—"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {u.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          u.role === "admin"
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {u.role ?? "user"}
                      </span>

                      <form action={setUserRole} className="inline-block">
                        <input type="hidden" name="userId" value={u.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={u.role === "admin" ? "user" : "admin"}
                        />
                        <button
                          type="submit"
                          className={`text-sm font-medium transition-colors ${
                            u.role === "admin"
                              ? "text-amber-600 dark:text-amber-500 hover:underline"
                              : "text-emerald-600 dark:text-emerald-500 hover:underline"
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
                          className="text-sm font-medium text-red-600 dark:text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
