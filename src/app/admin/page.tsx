/**
 * Admin dashboard (ensured)
 * Server-rendered admin area index; requires admin guard.
 */

import prisma from "@/lib/prisma";
import { PageWrapper } from "@/components/PageThemeContext";
import { requireAdmin } from "@/lib/requireAdmin";
import AdminDashboardContent from "./AdminDashboardContent";
import AdminToastsClient from "@/components/admin/AdminToastsClient";

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
    tabParam === "persons" || tabParam === "users" || tabParam === "orders"
      ? tabParam
      : "movies";

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

  const ordersCountPromise = prisma.order.count();

  // fetch recent orders for the admin orders tab
  const ordersPromise = prisma.order.findMany({
    orderBy: { orderDate: "desc" },
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

  const [
    movies,
    personsRaw,
    users,
    genres,
    personRolesRaw,
    userRolesRaw,
    totalOrdersCount,
    ordersRaw,
  ] = await Promise.all([
    moviesPromise,
    personsPromiseTyped,
    usersPromise,
    genresPromise,
    personRolesPromise,
    userRolesPromise,
    ordersCountPromise,
    ordersPromise,
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
    {
      label: "Orders",
      value: totalOrdersCount,
      sublabel: "Total",
      accent: "from-rose-500 to-red-500",
    },
  ];

  return (
    <PageWrapper>
      <AdminToastsClient />
      <div className="w-full max-w-6xl mx-auto px-4 md:px-0 flex flex-col gap-8 items-start">
        <main className="flex-1 bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 w-full">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted mt-1">
                Manage movies, people, users, and orders from one place
              </p>
              {adminUser?.name && (
                <p className="mt-2 text-sm text-muted">
                  Welcome back, {adminUser.name}.
                </p>
              )}
            </div>
          </div>

          <section className="mb-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-foreground opacity-90 ${
                      stat.label === "Movies"
                        ? "bg-gradient-to-r from-indigo-500 to-sky-500"
                        : stat.label === "People"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : stat.label === "Users"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : stat.label === "Genres"
                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                              : "bg-gradient-to-r from-rose-500 to-red-500"
                    }`}
                  >
                    {stat.label}
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-muted">
                      total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <AdminDashboardContent
            initialTab={tab as "movies" | "persons" | "users" | "orders"}
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
            orders={ordersRaw.map((o) => ({
              id: o.id,
              userId: o.userId,
              totalAmount: o.totalAmount.toString(),
              status: o.status,
              orderDate: o.orderDate.toISOString(),
              userName: users.find((u) => u.id === o.userId)?.name ?? null,
              userEmail: users.find((u) => u.id === o.userId)?.email ?? null,
            }))}
          />
        </main>
      </div>
    </PageWrapper>
  );
}
