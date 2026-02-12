"use client";

import * as React from "react";
// import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import AdminSearchInput from "@/components/AdminSearchInput";
import AdminTabSwitcher from "@/components/AdminTabSwitcher";
import { Button } from "@/components/ui/button";
import {
  archiveMovie,
  deleteMovie,
  unarchiveMovie,
} from "@/server/actions/moviesActions";
import { deleteUser, setUserRole } from "@/server/actions/usersActions";
import { cancelOrder } from "@/server/actions/ordersActions";

// ...existing type and interface definitions...

interface Movie {
  id: string;
  title: string;
  releaseYear: number | null;
  price: string | null;
  stock: number | null;
  isArchived: boolean;
  genres: GenreOption[];
}
interface Person {
  id: string;
  fullName: string;
  imageUrl: string | null;
  movies: Array<{ role: string; movieTitle: string }>;
}
interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
}

interface AdminDashboardContentProps {
  initialTab?: "movies" | "persons" | "users" | "orders";
  initialSearch?: string;
  initialGenre?: string;
  initialPersonRole?: string;
  initialUserRole?: string;
  movies: Movie[];
  persons: Person[];
  users: User[];
  genres: GenreOption[];
  personRoles: string[];
  userRoles: string[];
  orders: OrderForAdmin[];
}

export default function AdminDashboardContent({
  initialTab = "movies",
  initialSearch = "",
  initialGenre = "",
  initialPersonRole = "",
  initialUserRole = "",
  movies,
  persons,
  users,
  genres,
  personRoles,
  userRoles,
  orders,
}: AdminDashboardContentProps) {
  const [activeTab, setActiveTab] = React.useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = React.useState<string>(initialSearch);
  const [selectedGenre, setSelectedGenre] =
    React.useState<string>(initialGenre);
  const [selectedPersonRole, setSelectedPersonRole] =
    React.useState<string>(initialPersonRole);
  const [selectedUserRole, setSelectedUserRole] =
    React.useState<string>(initialUserRole);
  const [selectedOrderStatus, setSelectedOrderStatus] =
    React.useState<string>("");
  const [moviePage, setMoviePage] = React.useState<number>(1);
  const [personPage, setPersonPage] = React.useState<number>(1);
  const [userPage, setUserPage] = React.useState<number>(1);
  const [orderPage, setOrderPage] = React.useState<number>(1);

  // Filtering logic for each tab
  const filteredMovies = React.useMemo(() => {
    let filtered = movies;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(term),
      );
    }
    if (selectedGenre) {
      filtered = filtered.filter((movie) =>
        movie.genres.some((g) => g.id === selectedGenre),
      );
    }
    return filtered;
  }, [movies, searchTerm, selectedGenre]);

  const filteredPersons = React.useMemo(() => {
    let filtered = persons;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((person) =>
        person.fullName.toLowerCase().includes(term),
      );
    }
    if (selectedPersonRole) {
      filtered = filtered.filter((person) =>
        person.movies.some((m) => m.role === selectedPersonRole),
      );
    }
    return filtered;
  }, [persons, searchTerm, selectedPersonRole]);

  const filteredUsers = React.useMemo(() => {
    let filtered = users;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (user) =>
          (user.name ?? "").toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term),
      );
    }
    if (selectedUserRole) {
      filtered = filtered.filter((user) => user.role === selectedUserRole);
    }
    return filtered;
  }, [users, searchTerm, selectedUserRole]);

  const filteredOrders = React.useMemo(() => {
    let filtered = orders;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((order) =>
        [order.id, order.userName ?? "", order.userEmail ?? ""]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term)),
      );
    }
    if (selectedOrderStatus) {
      filtered = filtered.filter(
        (order) => order.status === selectedOrderStatus,
      );
    }
    return filtered;
  }, [orders, searchTerm, selectedOrderStatus]);

  // Pagination logic
  const paginatedMovies = React.useMemo(() => {
    const start = (moviePage - 1) * MOVIES_PAGE_SIZE;
    return filteredMovies.slice(start, start + MOVIES_PAGE_SIZE);
  }, [filteredMovies, moviePage]);
  const paginatedPersons = React.useMemo(() => {
    const start = (personPage - 1) * PERSONS_PAGE_SIZE;
    return filteredPersons.slice(start, start + PERSONS_PAGE_SIZE);
  }, [filteredPersons, personPage]);
  const paginatedUsers = React.useMemo(() => {
    const start = (userPage - 1) * USERS_PAGE_SIZE;
    return filteredUsers.slice(start, start + USERS_PAGE_SIZE);
  }, [filteredUsers, userPage]);
  const paginatedOrders = React.useMemo(() => {
    const start = (orderPage - 1) * ORDERS_PAGE_SIZE;
    return filteredOrders.slice(start, start + ORDERS_PAGE_SIZE);
  }, [filteredOrders, orderPage]);

  const showMoviePagination = filteredMovies.length > MOVIES_PAGE_SIZE;
  const showPersonPagination = filteredPersons.length > PERSONS_PAGE_SIZE;
  const showUserPagination = filteredUsers.length > USERS_PAGE_SIZE;
  const showOrderPagination = filteredOrders.length > ORDERS_PAGE_SIZE;

  // Reset page if filters change
  React.useEffect(() => {
    setMoviePage(1);
  }, [searchTerm, selectedGenre]);
  React.useEffect(() => {
    setPersonPage(1);
  }, [searchTerm, selectedPersonRole]);
  React.useEffect(() => {
    setUserPage(1);
  }, [searchTerm, selectedUserRole]);
  React.useEffect(() => {
    setOrderPage(1);
  }, [searchTerm, selectedOrderStatus]);

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-border bg-card p-4 shadow-2xl backdrop-blur-lg sm:p-6 lg:p-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <AdminTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

          <div
            role="search"
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <AdminSearchInput
              placeholder={
                activeTab === "movies"
                  ? "Search movies..."
                  : activeTab === "persons"
                    ? "Search people..."
                    : activeTab === "users"
                      ? "Search users..."
                      : "Search orders by ID, user name or email..."
              }
              value={searchTerm}
              onValueChange={setSearchTerm}
              syncToUrl={false}
              debounceMs={150}
            />

            {activeTab === "movies" && (
              <select
                aria-label="Filter by genre"
                value={selectedGenre}
                onChange={(event) => setSelectedGenre(event.target.value)}
                className="cursor-pointer min-w-40 rounded-lg border border-border bg-popover px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">All genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "persons" && (
              <select
                aria-label="Filter by person role"
                value={selectedPersonRole}
                onChange={(event) => setSelectedPersonRole(event.target.value)}
                className="cursor-pointer min-w-40 rounded-lg border border-border bg-popover px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">All roles</option>
                {personRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "users" && (
              <select
                aria-label="Filter by user role"
                value={selectedUserRole}
                onChange={(event) => setSelectedUserRole(event.target.value)}
                className="cursor-pointer min-w-40 rounded-lg border border-border bg-popover px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">All roles</option>
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "orders" && (
              <select
                aria-label="Filter by order status"
                value={selectedOrderStatus}
                onChange={(event) => setSelectedOrderStatus(event.target.value)}
                className="cursor-pointer min-w-40 rounded-lg border border-border bg-popover px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab content blocks as direct siblings below */}
        {activeTab === "movies" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4">
              {paginatedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-lg transition-all duration-300 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-popover text-lg font-bold uppercase text-muted">
                      {movie.title
                        .split(" ")
                        .map((segment) => segment[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-foreground">
                        {movie.title}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-muted">
                        {movie.genres.map((g) => g.name).join(", ") ||
                          "No genre"}
                      </div>
                      <div className="text-xs text-muted">
                        {movie.releaseYear
                          ? `Year: ${movie.releaseYear}`
                          : "No year"}
                        {movie.price ? ` | Price: SEK ${movie.price}` : ""}
                        {movie.stock !== null ? ` | Stock: ${movie.stock}` : ""}
                        {movie.isArchived ? " | Archived" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                    <Link
                      href={`/admin/movies/${movie.id}`}
                      className="font-semibold text-muted transition hover:text-foreground"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/movies/${movie.id}/edit`}
                      className="font-semibold text-muted transition hover:text-foreground"
                    >
                      Edit
                    </Link>
                    {movie.isArchived ? (
                      <form action={unarchiveMovie} className="inline-block">
                        <input type="hidden" name="movieId" value={movie.id} />
                        <Button
                          type="submit"
                          className="ml-2 rounded-full bg-success text-success-foreground hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-ring"
                          size="sm"
                          variant="default"
                          aria-label={`Unarchive movie ${movie.title}`}
                        >
                          Unarchive
                        </Button>
                      </form>
                    ) : (
                      <>
                        <form action={archiveMovie} className="inline-block">
                          <input
                            type="hidden"
                            name="movieId"
                            value={movie.id}
                          />
                          <Button
                            type="submit"
                            className="ml-2 rounded-full bg-muted text-foreground hover:bg-muted/90 focus:outline-none focus:ring-2 focus:ring-ring"
                            size="sm"
                            variant="secondary"
                            aria-label={`Archive movie ${movie.title}`}
                          >
                            Archive
                          </Button>
                        </form>
                        <form action={deleteMovie} className="inline-block">
                          <input
                            type="hidden"
                            name="movieId"
                            value={movie.id}
                          />
                          <Button
                            type="submit"
                            className="ml-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring"
                            size="sm"
                            variant="destructive"
                            aria-label={`Delete movie ${movie.title}`}
                          >
                            Delete
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {filteredMovies.length === 0 && (
                <div className="rounded-2xl p-6 text-center text-sm text-muted">
                  No movies match the current filters.
                </div>
              )}
            </div>
            {showMoviePagination && (
              <AdminPagination
                currentPage={moviePage}
                totalItems={filteredMovies.length}
                pageSize={MOVIES_PAGE_SIZE}
                onPageChange={setMoviePage}
              />
            )}
          </div>
        )}

        {activeTab === "persons" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4">
              {paginatedPersons.map((person) => {
                const roleSummary =
                  Array.from(
                    new Set(
                      person.movies.map((association) => association.role),
                    ),
                  ).join(", ") || "Not assigned";

                return (
                  <div
                    key={person.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-lg transition-all duration-300 sm:flex-row sm:items-center sm:justify-between"
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-popover text-sm font-semibold uppercase text-muted">
                          {person.fullName
                            .split(" ")
                            .map((segment) => segment[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}
                      <div>
                        <div className="text-base font-semibold text-foreground">
                          {person.fullName}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-wide text-muted">
                          {roleSummary}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                      <Link
                        href={`/admin/persons/${person.id}/edit`}
                        className="font-semibold text-muted transition hover:text-foreground"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}

              {filteredPersons.length === 0 && (
                <div className="rounded-2xl p-6 text-center text-sm text-muted">
                  No people match the current filters.
                </div>
              )}
            </div>
            {showPersonPagination && (
              <AdminPagination
                currentPage={personPage}
                totalItems={filteredPersons.length}
                pageSize={PERSONS_PAGE_SIZE}
                onPageChange={setPersonPage}
              />
            )}
          </div>
        )}

        {activeTab === "users" && (
          <>
            <div className="flex justify-end mb-4">
              <Link href="/admin/users/create">
                <Button className="rounded-xl px-4 py-2.5">+ New User</Button>
              </Link>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4">
                {paginatedUsers.map((user) => {
                  const initials = (user.name ?? user.email)
                    .split(" ")
                    .map((segment) => segment[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const resolvedRole = user.role ?? "user";

                  return (
                    <div
                      key={user.id}
                      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-lg transition-all duration-300 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-popover text-sm font-semibold uppercase text-muted">
                          {initials}
                        </div>
                        <div>
                          <div className="text-base font-semibold text-foreground">
                            {user.name ?? "—"}
                          </div>
                          <div className="text-sm text-muted">{user.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                        <span className="rounded-full border px-3 py-1 border-border bg-popover text-muted">
                          {resolvedRole}
                        </span>

                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="font-semibold text-muted transition hover:text-foreground"
                        >
                          Edit
                        </Link>

                        <form action={setUserRole} className="inline-flex">
                          <input type="hidden" name="userId" value={user.id} />
                          <input
                            type="hidden"
                            name="role"
                            value={resolvedRole === "admin" ? "user" : "admin"}
                          />
                          <Button
                            type="submit"
                            className="rounded-full"
                            size="sm"
                            aria-label={
                              resolvedRole === "admin"
                                ? "Revoke admin"
                                : "Grant admin"
                            }
                          >
                            {resolvedRole === "admin" ? "Revoke" : "Grant"}
                          </Button>
                        </form>

                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <Button
                            type="submit"
                            className="rounded-full"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="rounded-2xl p-6 text-center text-sm text-muted">
                    No users match the current filters.
                  </div>
                )}
              </div>
              {showUserPagination && (
                <AdminPagination
                  currentPage={userPage}
                  totalItems={filteredUsers.length}
                  pageSize={USERS_PAGE_SIZE}
                  onPageChange={setUserPage}
                />
              )}
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4">
              {paginatedOrders.map((order) => {
                const when = new Date(order.orderDate).toLocaleString();
                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-lg transition-all duration-300 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-base font-semibold text-foreground">
                          Order {order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-muted">
                          {order.userName ?? order.userEmail}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-foreground">
                        SEK {order.totalAmount}
                      </div>

                      <span className="rounded-full border px-3 py-1 border-border bg-popover text-muted">
                        {order.status}
                      </span>

                      <div className="text-sm text-muted">{when}</div>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-muted transition hover:text-foreground"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/orders/${order.id}/edit`}
                        className="font-semibold text-muted transition hover:text-foreground"
                      >
                        Edit
                      </Link>
                      {order.status !== "CANCELLED" && (
                        <form action={cancelOrder} className="inline-block">
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />
                          <Button
                            type="submit"
                            className="ml-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring"
                            size="sm"
                            variant="destructive"
                            aria-label={`Cancel order ${order.id}`}
                          >
                            Cancel
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="rounded-2xl p-6 text-center text-sm text-muted">
                  No orders match the current filters.
                </div>
              )}
            </div>
            {showOrderPagination && (
              <AdminPagination
                currentPage={orderPage}
                totalItems={filteredOrders.length}
                pageSize={ORDERS_PAGE_SIZE}
                onPageChange={setOrderPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type OrderForAdmin = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  totalAmount: string;
  status: string;
  orderDate: string;
};

type GenreOption = {
  id: string;
  name: string;
};

const MOVIES_PAGE_SIZE = 12;
const PERSONS_PAGE_SIZE = 8;
const USERS_PAGE_SIZE = 8;
const ORDERS_PAGE_SIZE = 10;

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function AdminPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  // Removed unused: firstItem, lastItem, pages
  const maxVisible = 5;
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    // ...existing code...
  }
  // ...existing code...
}
