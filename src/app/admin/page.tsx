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
    new Set(personRolesRaw.map((r) => r.role))
  ).filter(Boolean);
  const userRoles = Array.from(new Set(userRolesRaw.map((r) => r.role))).filter(
    Boolean
  );

  // compute order reference counts per movie so we can control permanent delete UI
  const orderCountsArr = await Promise.all(
    movies.map((m) => prisma.orderItem.count({ where: { movieId: m.id } }))
  );
  const orderCounts = new Map(movies.map((m, i) => [m.id, orderCountsArr[i]]));

  // server actions are centralized under src/app/actions/*

  return (
    <div>
      {/* header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            Admin Management
          </h1>
          {adminUser?.name && (
            <p className="text-sm text-gray-600 mt-1">
              Signed in as {adminUser.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {tab === "movies" && (
            <Link
              href="/admin/movies/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm hover:bg-blue-700"
            >
              + Create Movie
            </Link>
          )}
          {tab === "persons" && (
            <Link
              href="/admin/persons/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm hover:bg-blue-700"
            >
              + Create Person
            </Link>
          )}
          {tab === "users" && (
            <Link
              href="/admin/users/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm hover:bg-blue-700"
            >
              + Create User
            </Link>
          )}
        </div>
      </div>

      {/* tabs + search row */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Link
              href="/admin?tab=movies"
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${
                tab === "movies"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border"
              }`}
            >
              Movies
            </Link>
            <Link
              href="/admin?tab=persons"
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${
                tab === "persons"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border"
              }`}
            >
              Persons
            </Link>
            <Link
              href="/admin?tab=users"
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${
                tab === "users"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border"
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
                className="pl-3 pr-10 py-1.5 text-gray-600 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z"
                  />
                </svg>
              </button>
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
      <div className="max-w-7xl mx-auto">
        {tab === "movies" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {movie.title}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      {movie.releaseDate?.getFullYear() ?? "—"} •{" "}
                      {movie.genres.map((g) => g.genre.name).join(", ") || "—"}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-gray-700 font-medium">
                        {movie.price != null ? `$${String(movie.price)}` : "—"}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">
                        Stock: {movie.stock ?? "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {movie.isArchived ? (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        Archived
                      </span>
                    ) : null}
                    <div className="text-xs text-gray-400">
                      <div>{movie.createdAt?.toISOString().split("T")[0]}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/movies/${movie.id}/edit`}
                      className="inline-flex items-center gap-2 text-indigo-600 text-sm hover:underline"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536M9 11l6 6L21 11l-6-6-6 6z"
                        />
                      </svg>
                      Edit
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    {!movie.isArchived ? (
                      <form action={archiveMovie}>
                        <input type="hidden" name="movieId" value={movie.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 text-yellow-600 text-sm hover:underline"
                        >
                          Archive
                        </button>
                      </form>
                    ) : (
                      <form action={unarchiveMovie}>
                        <input type="hidden" name="movieId" value={movie.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 text-green-600 text-sm hover:underline"
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
                        className={`text-sm px-2 py-1 rounded-full transition ${
                          (orderCounts.get(movie.id) ?? 0) > 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                        title={
                          (orderCounts.get(movie.id) ?? 0) > 0
                            ? "Cannot permanently delete: movie has associated orders"
                            : "Permanently delete movie"
                        }
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "persons" && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {persons.map((person) => {
          const roles =
            Array.from(
              new Set((person.movies || []).map((m) => m.role))
            ).join(", ") || "—";
          return (
            <li
              key={person.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {person.imageUrl ? (
            <img
              src={person.imageUrl}
              alt={person.fullName}
              className="h-10 w-10 rounded-full bg-indigo-50 object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
                ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-semibold">
              {person.fullName
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </div>
                )}
                <div>
            <div className="font-medium text-gray-800">
              {person.fullName}
            </div>
            <div className="text-sm text-gray-500">{roles}</div>
            <div className="text-xs text-gray-400 mt-1">
              {(person.movies || [])
                .map((m) => m.movie.title)
                .join(", ") || "—"}
            </div>
                </div>
              </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/persons/${person.id}/edit`}
                        className="text-indigo-600 text-sm hover:underline"
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
                          className="text-red-600 text-sm hover:underline"
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
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-semibold">
                      {u.name
                        ? u.name
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                        : u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {u.name ?? "—"}
                      </div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                      {u.role ?? "user"}
                    </div>

                    <form action={setUserRole} className="inline-block">
                      <input type="hidden" name="userId" value={u.id} />
                      <input
                        type="hidden"
                        name="role"
                        value={u.role === "admin" ? "user" : "admin"}
                      />
                      <button
                        type="submit"
                        className={`text-sm px-2 py-1 rounded-full transition ${
                          u.role === "admin"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
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
                        className="text-red-600 text-sm hover:underline"
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
    </div>
  );
}
