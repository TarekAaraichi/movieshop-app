"use client";

import * as React from "react";
import toast from "react-hot-toast";
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

type AdminTab = "movies" | "persons" | "users" | "orders";

type MovieForAdmin = {
  id: string;
  title: string;
  releaseYear: number | null;
  price: string | null;
  stock: number | null;
  isArchived: boolean;
  genres: Array<{ id: string; name: string }>;
};

type PersonForAdmin = {
  id: string;
  fullName: string;
  imageUrl: string | null;
  movies: Array<{ role: string; movieTitle: string }>;
};

type UserForAdmin = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
};

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

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(firstItem + pageSize - 1, totalItems);

  const pages: Array<number | string> = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push("ellipsis-start");
    }
  }

  for (let page = startPage; page <= endPage; page++) {
    pages.push(page);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push("ellipsis-end");
    }
    pages.push(totalPages);
  }

  const buttonBase =
    "min-w-[2.5rem] px-3 py-2 rounded-lg border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/40";
  const inactiveClasses =
    "border border-border bg-card text-muted hover:brightness-95";
  const activeClasses = "border-border bg-popover text-foreground shadow-sm";
  const disabledClasses = "opacity-40 cursor-not-allowed";

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <p className="text-xs uppercase tracking-wide text-muted">
        {totalItems === 0
          ? "Showing 0 results"
          : `Showing ${firstItem}-${lastItem} of ${totalItems}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`${buttonBase} ${inactiveClasses} ${
            currentPage === 1 ? disabledClasses : ""
          }`}
          aria-label="Previous page"
        >
          Prev
        </Button>
        {pages.map((page, index) => {
          if (typeof page === "string") {
            return (
              <span
                key={`${page}-${index}`}
                className="px-2 text-sm text-muted"
              >
                …
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page)}
              className={`${buttonBase} ${
                isActive ? activeClasses : inactiveClasses
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </Button>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`${buttonBase} ${inactiveClasses} ${
            currentPage === totalPages ? disabledClasses : ""
          }`}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

interface AdminDashboardContentProps {
  initialTab: AdminTab;
  initialSearch: string;
  initialGenre?: string;
  initialPersonRole?: string;
  initialUserRole?: string;
  movies: MovieForAdmin[];
  persons: PersonForAdmin[];
  users: UserForAdmin[];
  genres: GenreOption[];
  personRoles: string[];
  userRoles: string[];
  orderCounts: Record<string, number>;
  orders?: OrderForAdmin[];
}

export default function AdminDashboardContent({
  initialTab,
  initialSearch,
  initialGenre,
  initialPersonRole,
  initialUserRole,
  movies,
  persons,
  users,
  genres,
  personRoles,
  userRoles,
  orderCounts,
  orders,
}: AdminDashboardContentProps) {
  const [activeTab, setActiveTab] = React.useState<AdminTab>(initialTab);
  const [searchTerm, setSearchTerm] = React.useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = React.useState(initialGenre ?? "");
  const [selectedPersonRole, setSelectedPersonRole] = React.useState(
    initialPersonRole ?? "",
  );
  const [selectedUserRole, setSelectedUserRole] = React.useState(
    initialUserRole ?? "",
  );
  const [moviePage, setMoviePage] = React.useState(1);
  const [personPage, setPersonPage] = React.useState(1);
  const [userPage, setUserPage] = React.useState(1);
  const [orderPage, setOrderPage] = React.useState(1);
  const [selectedOrderStatus, setSelectedOrderStatus] = React.useState("");

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Show a one-time toast when arriving after an action
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    const created = params.get("created");
    const updated = params.get("updated");
    const deleted = params.get("deleted");
    const archived = params.get("archived");
    const unarchived = params.get("unarchived");
    const granted = params.get("granted");
    const revoked = params.get("revoked");
    const error = params.get("error");

    const title = params.get("title") || params.get("name");

    if (created) {
      const msg = title ? `Successfully created "${title}"` : "Item created";
      toast.success(msg);
    } else if (updated) {
      const msg = title ? `Successfully updated "${title}"` : "Item updated";
      toast.success(msg);
    } else if (deleted) {
      const msg = title ? `Successfully deleted "${title}"` : "Item deleted";
      toast.success(msg);
    } else if (archived) {
      const msg = title ? `Successfully archived "${title}"` : "Item archived";
      toast.success(msg);
    } else if (unarchived) {
      const msg = title
        ? `Successfully unarchived "${title}"`
        : "Item unarchived";
      toast.success(msg);
    } else if (granted) {
      const msg = title ? `Granted admin to "${title}"` : "Admin role granted";
      toast.success(msg);
    } else if (revoked) {
      const msg = title
        ? `Revoked admin from "${title}"`
        : "Admin role revoked";
      toast.success(msg);
    } else if (error) {
      if (error === "exists") {
        const msg = title ? `"${title}" already exists` : "Item already exists";
        toast.error(msg);
      } else {
        toast.error(error);
      }
    }

    // Clean up URL params
    [
      "created",
      "updated",
      "deleted",
      "archived",
      "unarchived",
      "granted",
      "revoked",
      "error",
      "title",
      "name",
    ].forEach((p) => params.delete(p));

    const next = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, "", next);
  }, []);

  React.useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  React.useEffect(() => {
    setSelectedGenre(initialGenre ?? "");
  }, [initialGenre]);

  React.useEffect(() => {
    setSelectedPersonRole(initialPersonRole ?? "");
  }, [initialPersonRole]);

  React.useEffect(() => {
    setSelectedUserRole(initialUserRole ?? "");
  }, [initialUserRole]);

  React.useEffect(() => {
    setMoviePage(1);
    setPersonPage(1);
    setUserPage(1);
    setOrderPage(1);
  }, [searchTerm]);

  React.useEffect(() => {
    setMoviePage(1);
  }, [selectedGenre]);

  React.useEffect(() => {
    setPersonPage(1);
  }, [selectedPersonRole]);

  React.useEffect(() => {
    setUserPage(1);
  }, [selectedUserRole]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    [
      "tab",
      "q",
      "genre",
      "role",
      "personRole",
      "userRole",
      "orderStatus",
    ].forEach((key) => {
      params.delete(key);
    });

    if (activeTab !== "movies") {
      params.set("tab", activeTab);
    }
    if (searchTerm) {
      params.set("q", searchTerm);
    }
    if (selectedGenre) {
      params.set("genre", selectedGenre);
    }
    if (selectedPersonRole) {
      params.set("personRole", selectedPersonRole);
      if (activeTab === "persons") {
        params.set("role", selectedPersonRole);
      }
    }
    if (selectedUserRole) {
      params.set("userRole", selectedUserRole);
      if (activeTab === "users") {
        params.set("role", selectedUserRole);
      }
    }
    if (selectedOrderStatus) {
      params.set("orderStatus", selectedOrderStatus);
    }

    const query = params.toString();
    const nextUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [
    activeTab,
    searchTerm,
    selectedGenre,
    selectedPersonRole,
    selectedUserRole,
    selectedOrderStatus,
  ]);

  // keep selectedOrderStatus initialised to empty

  const filteredMovies = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchesTerm = term
        ? movie.title.toLowerCase().includes(term)
        : true;
      const matchesGenre = selectedGenre
        ? movie.genres.some((g) => g.id === selectedGenre)
        : true;
      return matchesTerm && matchesGenre;
    });
  }, [movies, searchTerm, selectedGenre]);

  const filteredPersons = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return persons.filter((person) => {
      const matchesTerm = term
        ? person.fullName.toLowerCase().includes(term)
        : true;
      const matchesRole = selectedPersonRole
        ? person.movies.some(
            (association) => association.role === selectedPersonRole,
          )
        : true;
      return matchesTerm && matchesRole;
    });
  }, [persons, searchTerm, selectedPersonRole]);

  const filteredUsers = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesTerm = term
        ? [user.name ?? "", user.email]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;
      const matchesRole = selectedUserRole
        ? (user.role ?? "user") === selectedUserRole
        : true;
      return matchesTerm && matchesRole;
    });
  }, [users, searchTerm, selectedUserRole]);

  const filteredOrders = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const allOrders = orders ?? ([] as OrderForAdmin[]);
    return allOrders.filter((order) => {
      const matchesTerm = term
        ? [order.id, order.userName ?? "", order.userEmail ?? ""]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;
      const matchesStatus = selectedOrderStatus
        ? order.status === selectedOrderStatus
        : true;
      return matchesTerm && matchesStatus;
    });
  }, [orders, searchTerm, selectedOrderStatus]);

  const totalOrderPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE),
  );

  React.useEffect(() => {
    setOrderPage((previous) => Math.min(previous, totalOrderPages));
  }, [totalOrderPages]);

  const paginatedOrders = React.useMemo(() => {
    const start = (orderPage - 1) * ORDERS_PAGE_SIZE;
    return filteredOrders.slice(start, start + ORDERS_PAGE_SIZE);
  }, [filteredOrders, orderPage]);

  const showOrderPagination = filteredOrders.length > ORDERS_PAGE_SIZE;

  const totalMoviePages = Math.max(
    1,
    Math.ceil(filteredMovies.length / MOVIES_PAGE_SIZE),
  );
  const totalPersonPages = Math.max(
    1,
    Math.ceil(filteredPersons.length / PERSONS_PAGE_SIZE),
  );
  const totalUserPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PAGE_SIZE),
  );

  React.useEffect(() => {
    setMoviePage((previous) => Math.min(previous, totalMoviePages));
  }, [totalMoviePages]);

  React.useEffect(() => {
    setPersonPage((previous) => Math.min(previous, totalPersonPages));
  }, [totalPersonPages]);

  React.useEffect(() => {
    setUserPage((previous) => Math.min(previous, totalUserPages));
  }, [totalUserPages]);

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

  const showMoviePagination = filteredMovies.length > MOVIES_PAGE_SIZE;
  const showPersonPagination = filteredPersons.length > PERSONS_PAGE_SIZE;
  const showUserPagination = filteredUsers.length > USERS_PAGE_SIZE;

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

        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          {activeTab === "movies" && (
            <Link href="/admin/movies/create" className="inline-flex">
              <Button className="rounded-xl" asChild>
                <a className="px-4 py-2.5">+ New Movie</a>
              </Button>
            </Link>
          )}
        </div>

        {activeTab === "movies" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedMovies.map((movie) => {
                const genreNames =
                  movie.genres
                    .map((association) => association.name)
                    .join(", ") || "—";
                const releaseLabel = movie.releaseYear ?? "—";
                const disableDelete = (orderCounts[movie.id] ?? 0) > 0;
                return (
                  <div
                    key={movie.id}
                    className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg transition-all duration-300 hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-foreground">
                          {movie.title}
                        </h3>
                        {movie.isArchived && (
                          <span className="whitespace-nowrap rounded-full border border-border bg-popover px-2.5 py-1 text-xs font-semibold text-muted">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {releaseLabel} &middot; {genreNames}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-sm">
                        <span className="font-semibold text-foreground">
                          {movie.price != null ? `SEK ${movie.price}` : "—"}
                        </span>
                        <span className="text-muted">|</span>
                        <span className="text-muted">
                          Stock {movie.stock ?? "—"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <Link
                        href={`/admin/movies/${movie.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
                      >
                        Edit
                      </Link>

                      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 text-xs font-semibold uppercase tracking-wide">
                        {!movie.isArchived ? (
                          <form
                            action={archiveMovie}
                            className="w-full sm:w-auto"
                          >
                            <input
                              type="hidden"
                              name="movieId"
                              value={movie.id}
                            />
                            <Button
                              type="submit"
                              aria-label={`Archive ${movie.title}`}
                              className="w-full sm:w-auto rounded-full"
                              size="sm"
                            >
                              Archive
                            </Button>
                          </form>
                        ) : (
                          <form
                            action={unarchiveMovie}
                            className="w-full sm:w-auto"
                          >
                            <input
                              type="hidden"
                              name="movieId"
                              value={movie.id}
                            />
                            <Button
                              type="submit"
                              aria-label={`Unarchive ${movie.title}`}
                              className="w-full sm:w-auto rounded-full"
                              size="sm"
                            >
                              Unarchive
                            </Button>
                          </form>
                        )}

                        <form action={deleteMovie} className="w-full sm:w-auto">
                          <input
                            type="hidden"
                            name="movieId"
                            value={movie.id}
                          />
                          <Button
                            type="submit"
                            aria-label={`Delete ${movie.title}`}
                            disabled={disableDelete}
                            className="w-full sm:w-auto rounded-full"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredMovies.length === 0 && (
                <div className="col-span-full rounded-2xl p-6 text-center text-sm text-muted">
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
                      {order.status !== "CANCELLED" && (
                        <form action={cancelOrder} className="inline-block">
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />
                          <Button
                            type="submit"
                            className="ml-2 rounded-full"
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
