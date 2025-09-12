import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// AdminPage server component
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { q?: string; tab?: string };
}) {
  const q = searchParams.q ?? "";
  const tab = (searchParams.tab ?? "movies") as string;

  const moviesPromise = prisma.movie.findMany({
    where: q
      ? {
          title: { contains: q, mode: "insensitive" },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      genres: { include: { genre: true } },
      people: { include: { person: true } },
    },
  });

  const personsPromise = prisma.person.findMany({
    where: q
      ? {
          fullName: { contains: q, mode: "insensitive" },
        }
      : undefined,
    orderBy: { fullName: "asc" },
    include: { movies: { include: { movie: true } } },
  });

  const usersPromise = prisma.user.findMany({ orderBy: { email: "asc" } });

  const [movies, persons, users] = await Promise.all([
    moviesPromise,
    personsPromise,
    usersPromise,
  ]);

  // server action for deleting a movie
  async function deleteMovie(formData: FormData) {
    "use server";
    const id = formData.get("movieId") as string;
    if (!id) {
      throw new Error("Missing movie ID");
    }
    await prisma.movie.delete({ where: { id } });
    // refresh admin page to reflect deletion
    revalidatePath("/admin");
  }

  // server action for deleting a user
  async function deleteUser(formData: FormData) {
    "use server";
    const id = formData.get("userId") as string;
    if (!id) throw new Error("Missing user ID");
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin");
  }

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
      <form method="GET" className="mb-4">
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
                  Genre
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Director
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
                const directorLink = movie.people.find(
                  (p) => p.role === "DIRECTOR"
                );
                return (
                  <tr key={movie.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">{movie.title}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {movie.genres.map((g) => g.genre.name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {directorLink?.person.fullName ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {movie.releaseDate?.toISOString().split("T")[0]}
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
                      <form action={deleteMovie} className="inline-block">
                        <input type="hidden" name="movieId" value={movie.id} />
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
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          const id = formData.get("personId") as string;
                          if (!id) throw new Error("Missing id");
                          await prisma.person.delete({ where: { id } });
                          revalidatePath("/admin");
                        }}
                        className="inline-block"
                      >
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
          <div className="mb-4">
            <Link
              href="/admin/users/create"
              className="bg-green-600 text-white py-2 px-4 rounded-md shadow hover:bg-green-700"
            >
              Create User
            </Link>
          </div>
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
