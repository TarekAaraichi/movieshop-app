import prisma from "@/lib/prisma";
import Link from "next/link";
import AutoSubmitSelect from "@/components/AutoSubmitSelect";
import {
  archiveMovie,
  unarchiveMovie,
  deleteMovie,
} from "@/app/actions/movies";
import { deletePerson } from "@/app/actions/persons";
import { deleteUser, setUserRole } from "@/app/actions/users";

// AdminPage server component
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { q?: string; tab?: string };
}) {
  const q = searchParams.q ?? "";
  const tab = (searchParams.tab ?? "movies") as string;

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
                some: { role: { equals: searchParams.role as string } },
              },
            }
          : {},
      ],
    },
    orderBy: { fullName: "asc" },
    include: { movies: { include: { movie: true } } },
  });

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

  const [movies, persons, users, genres, personRolesRaw, userRolesRaw] =
    await Promise.all([
      moviesPromise,
      personsPromise,
      usersPromise,
      genresPromise,
      personRolesPromise,
      userRolesPromise,
    ]);

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

  /*
    Admin auth scaffold (commented out):
    Uncomment and adapt to require sign-in and admin role before rendering admin UI.
    Example:
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect(`/sign-in?callbackUrl=${encodeURIComponent('/admin')}`);
    if (session.user.role !== 'admin') {
      // Optionally show a 403 or redirect
      redirect('/');
    }
  */

  // server actions are centralized under src/app/actions/*

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* page header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Admin Management
        </h1>
        <div className="space-x-2">
          {tab === "movies" && (
            <Link
              href="/admin/create"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700"
            >
              Create New Movie
            </Link>
          )}
          {tab === "users" && (
            <Link
              href="/admin/users/create"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700"
            >
              Create New User
            </Link>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className="mb-4 flex space-x-2">
        <Link
          href="/admin?tab=movies"
          className={`px-4 py-2 rounded ${
            tab === "movies"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          Movies
        </Link>
        <Link
          href="/admin?tab=persons"
          className={`px-4 py-2 rounded ${
            tab === "persons"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          Persons
        </Link>
        <Link
          href="/admin?tab=users"
          className={`px-4 py-2 rounded ${
            tab === "users"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          Users
        </Link>
      </div>

      {/* search form */}
      <form method="GET" className="mb-4 flex items-center space-x-3">
        <input
          name="q"
          type="search"
          placeholder={
            tab === "movies"
              ? "Search by title..."
              : tab === "persons"
              ? "Search by person name..."
              : "Search by name or email..."
          }
          defaultValue={q}
          className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-800 focus:ring focus:ring-indigo-300"
        />
        {/* keep the active tab so filters stay on the current tab */}
        <input type="hidden" name="tab" value={tab} />

        {tab === "movies" && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Genre</span>
            <AutoSubmitSelect
              name="genre"
              value={searchParams.genre as string}
              ariaLabel="Filter by genre"
              options={genres.map((g) => ({ value: g.id, label: g.name }))}
              className="min-w-[160px]"
            />
          </div>
        )}

        {tab === "persons" && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Role</span>
            <AutoSubmitSelect
              name="role"
              value={searchParams.role as string}
              ariaLabel="Filter by person role"
              options={personRoles.map((r) => ({ value: r, label: r }))}
              className="min-w-[160px]"
            />
          </div>
        )}

        {tab === "users" && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Role</span>
            <AutoSubmitSelect
              name="role"
              value={searchParams.role as string}
              ariaLabel="Filter by user role"
              options={userRoles.map((r) => ({ value: r, label: r }))}
              className="min-w-[160px]"
            />
          </div>
        )}
      </form>

      {/* content by tab */}
      {tab === "movies" && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Stock
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Genre
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actors
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Release Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Created At
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Updated At
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movies.map((movie) => {
                const actorNames =
                  (movie.people || [])
                    .filter((p) => p.role === "ACTOR")
                    .map((p) => p.person.fullName)
                    .slice(0, 3)
                    .join(", ") || "—";
                return (
                  <tr key={movie.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">{movie.title}</td>
                    <td className="px-4 py-2 text-gray-800">
                      {movie.price != null ? `$${String(movie.price)}` : "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-800">
                      {movie.stock ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {movie.genres.map((g) => g.genre.name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{actorNames}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {movie.releaseDate?.getFullYear()}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {movie.createdAt?.toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {movie.updatedAt?.toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-2 space-x-4">
                      <Link
                        href={`/movies/${movie.id}/edit`}
                        className="text-indigo-600 hover:underline"
                      >
                        Edit
                      </Link>
                      {movie.isArchived && (
                        <span className="text-sm text-gray-500">Archived</span>
                      )}

                      {/* Archive / Unarchive actions */}
                      {!movie.isArchived ? (
                        <form action={archiveMovie} className="inline-block">
                          <input
                            type="hidden"
                            name="movieId"
                            value={movie.id}
                          />
                          <button
                            type="submit"
                            className="text-yellow-600 hover:underline"
                          >
                            Archive
                          </button>
                        </form>
                      ) : (
                        <form action={unarchiveMovie} className="inline-block">
                          <input
                            type="hidden"
                            name="movieId"
                            value={movie.id}
                          />
                          <button
                            type="submit"
                            className="text-green-600 hover:underline"
                          >
                            Unarchive
                          </button>
                        </form>
                      )}

                      {/* Permanent delete, only allowed when no order refs */}
                      <form action={deleteMovie} className="inline-block">
                        <input type="hidden" name="movieId" value={movie.id} />
                        <button
                          type="submit"
                          disabled={(orderCounts.get(movie.id) ?? 0) > 0}
                          className={`${
                            (orderCounts.get(movie.id) ?? 0) > 0
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 hover:underline"
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "persons" && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Bio
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Movies
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Roles
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {persons.map((person) => {
                const roles =
                  Array.from(
                    new Set((person.movies || []).map((m) => m.role))
                  ).join(", ") || "—";
                return (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">
                      {person.fullName}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {person.bio ? person.bio.slice(0, 80) : "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {(person.movies || [])
                        .map((m) => m.movie.title)
                        .slice(0, 3)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{roles}</td>
                    <td className="px-4 py-2 space-x-4">
                      <Link
                        href={`/admin/persons/${person.id}/edit`}
                        className="text-indigo-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deletePerson} className="inline-block">
                        <input
                          type="hidden"
                          name="personId"
                          value={person.id}
                        />
                        <button
                          type="submit"
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Role
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{u.name ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-800">{u.email}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {u.role ?? "user"}
                  </td>
                  <td className="px-4 py-2 space-x-4">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className="text-indigo-600 hover:underline"
                    >
                      Edit
                    </Link>

                    {/* Grant / Revoke admin role form - placed next to Edit/Delete */}
                    <form action={setUserRole} className="inline-block">
                      <input type="hidden" name="userId" value={u.id} />
                      <input
                        type="hidden"
                        name="role"
                        value={u.role === "admin" ? "user" : "admin"}
                      />
                      <button
                        type="submit"
                        className={`hover:underline ${
                          u.role === "admin"
                            ? "text-red-600 hover:text-red-700"
                            : "text-green-600 hover:text-green-700"
                        }`}
                        title={
                          u.role === "admin" ? "Revoke admin" : "Grant admin"
                        }
                      >
                        {u.role === "admin" ? "Revoke" : "Grant"}
                      </button>
                    </form>

                    <form action={deleteUser} className="inline-block">
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
