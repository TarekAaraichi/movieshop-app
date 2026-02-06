/**
 * Admin dashboard (ensured)
 * Server-rendered admin area index; requires admin guard.
 */

import prisma from "@/lib/prisma";
import { PageWrapper } from "@/components/PageThemeContext";
import { requireAdmin } from "@/lib/requireAdmin";
import AdminDashboardContent from "./AdminDashboardContent";

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
  searchParams: {
    q?: string;
    tab?: string;
    genre?: string;
    role?: string;
    personRole?: string;
    userRole?: string;
  };
}) {
  const q = searchParams.q ?? "";
  const tabParam = searchParams.tab;
  const tab =
    tabParam === "persons" || tabParam === "users" ? tabParam : "movies";

  const initialPersonRoleParam =
    (searchParams.personRole as string | undefined) ??
    (tab === "persons" ? (searchParams.role as string | undefined) : undefined);
  const initialUserRoleParam =
    (searchParams.userRole as string | undefined) ??
    (tab === "users" ? (searchParams.role as string | undefined) : undefined);

  const { user: adminUser } = await requireAdmin("/admin");

  const moviesPromise = prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      genres: { include: { genre: true } },
    },
  });

  const personsPromise = prisma.person.findMany({
    orderBy: { fullName: "asc" },
    include: { movies: { include: { movie: true } } },
  });
  const personsPromiseTyped = personsPromise as Promise<
    Array<PersonWithMovies>
  >;

  const usersPromise = prisma.user.findMany({
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

  const persons = personsRaw as Array<PersonWithMovies>;

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

  return (
    <PageWrapper>
      <div className="rounded-3xl bg-transparent">
        <div className="min-h-screen space-y-8 text-zinc-100 p-4 sm:p-6 lg:p-8">
          <header className="max-w-7xl mx-auto">
            <div className="rounded-3xl border border-zinc-800 bg-linear-to-br from-gray-900 via-gray-700 to-gray-500 p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                    Control Center
                  </span>
                  <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">
                    Admin Dashboard
                  </h1>
                  {adminUser?.name && (
                    <p className="mt-2 text-sm text-indigo-100/80">
                      Welcome back, {adminUser.name}. Manage content, people,
                      and users from one place.
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
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  <div
                    className={`inline-flex items-center rounded-full bg-linear-to-r ${stat.accent} px-3 py-1 text-xs font-semibold text-white/90`}
                  >
                    {stat.label}
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                      {stat.value}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-zinc-400">
                      total
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{stat.sublabel}</p>
                </div>
              ))}
            </div>
          </section>

          <AdminDashboardContent
            initialTab={tab as "movies" | "persons" | "users"}
            initialSearch={q}
            initialGenre={searchParams.genre as string | undefined}
            initialPersonRole={initialPersonRoleParam}
            initialUserRole={initialUserRoleParam}
            movies={movies.map((movie) => ({
              id: movie.id,
              title: movie.title,
              releaseYear: movie.releaseDate?.getFullYear() ?? null,
              price:
                movie.price != null
                  ? typeof movie.price === "object"
                    ? movie.price.toString()
                    : String(movie.price)
                  : null,
              stock: movie.stock ?? null,
              isArchived: movie.isArchived,
              genres: movie.genres.map((g) => ({
                id: g.genreId,
                name: g.genre.name,
              })),
            }))}
            persons={persons.map((person) => ({
              id: person.id,
              fullName: person.fullName,
              imageUrl: person.imageUrl,
              movies: (person.movies || []).map((m) => ({
                role: m.role,
                movieTitle: m.movie.title,
              })),
            }))}
            users={users.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            }))}
            genres={genres.map((genre) => ({ id: genre.id, name: genre.name }))}
            personRoles={personRoles}
            userRoles={userRoles}
            orderCounts={Object.fromEntries(orderCounts.entries())}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
