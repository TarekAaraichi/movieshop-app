"use client";

import * as React from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import AdminSearchInput from "@/components/AdminSearchInput";
import AdminTabSwitcher from "@/components/AdminTabSwitcher";
import {
  archiveMovie,
  deleteMovie,
  unarchiveMovie,
} from "@/server/actions/moviesActions";
import { deleteUser, setUserRole } from "@/server/actions/usersActions";

type AdminTab = "movies" | "persons" | "users";

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

type GenreOption = {
  id: string;
  name: string;
};

const MOVIES_PAGE_SIZE = 12;
const PERSONS_PAGE_SIZE = 8;
const USERS_PAGE_SIZE = 8;

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
    "min-w-[2.5rem] px-3 py-2 rounded-lg border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-200/60 dark:focus:ring-indigo-400/40";
  const inactiveClasses =
    "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-700 bg-gray-900 dark:text-gray-200 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/10 dark:hover:text-white";
  const activeClasses =
    "border-indigo-300 bg-indigo-100 text-indigo-800 shadow-sm dark:border-indigo-400/60 dark:bg-indigo-500/30 dark:text-indigo-100";
  const disabledClasses = "opacity-40 cursor-not-allowed";

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {totalItems === 0
          ? "Showing 0 results"
          : `Showing ${firstItem}-${lastItem} of ${totalItems}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`${buttonBase} ${inactiveClasses} ${
            currentPage === 1 ? disabledClasses : ""
          }`}
          aria-label="Previous page"
        >
          Prev
        </button>
        {pages.map((page, index) => {
          if (typeof page === "string") {
            return (
              <span
                key={`${page}-${index}`}
                className="px-2 text-sm text-gray-400 dark:text-gray-500"
              >
                …
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`${buttonBase} ${
                isActive ? activeClasses : inactiveClasses
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`${buttonBase} ${inactiveClasses} ${
            currentPage === totalPages ? disabledClasses : ""
          }`}
          aria-label="Next page"
        >
          Next
        </button>
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
    ["tab", "q", "genre", "role", "personRole", "userRole"].forEach((key) => {
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
  ]);

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
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200/10 bg-gray-800/50 p-4 shadow-2xl backdrop-blur-lg sm:p-6 lg:p-8">
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
                    : "Search users..."
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
                className="min-w-40 rounded-lg border border-slate-300 bg-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700"
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
                className="min-w-40 rounded-lg border border-slate-300 bg-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700"
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
                className="min-w-40 rounded-lg border border-slate-300 bg-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700"
              >
                <option value="">All roles</option>
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          {activeTab === "movies" && (
            <Link
              href="/admin/movies/create"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              + New Movie
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
                    className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-800/40 p-5 shadow-lg transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:shadow-indigo-500/10"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-slate-100">
                          {movie.title}
                        </h3>
                        {movie.isArchived && (
                          <span className="whitespace-nowrap rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {releaseLabel} &middot; {genreNames}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-sm">
                        <span className="font-semibold text-emerald-400">
                          {movie.price != null ? `SEK ${movie.price}` : "—"}
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-400">
                          Stock {movie.stock ?? "—"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                      <Link
                        href={`/admin/movies/${movie.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
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
                              className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-300 transition hover:bg-amber-400/20"
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
                              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300 transition hover:bg-emerald-400/20"
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
                            disabled={disableDelete}
                            className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-red-400 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-transparent disabled:text-slate-500"
                            title={
                              disableDelete
                                ? "Cannot delete: movie has associated orders"
                                : "Permanently delete movie"
                            }
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredMovies.length === 0 && (
                <div className="col-span-full rounded-2xl p-6 text-center text-sm text-slate-400">
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
                    className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-800/40 p-4 shadow-lg transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-800/80 sm:flex-row sm:items-center sm:justify-between"
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-400/10 text-sm font-semibold uppercase text-indigo-200">
                          {person.fullName
                            .split(" ")
                            .map((segment) => segment[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}
                      <div>
                        <div className="text-base font-semibold text-slate-100">
                          {person.fullName}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                          {roleSummary}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                      <Link
                        href={`/admin/persons/${person.id}/edit`}
                        className="font-semibold text-indigo-400 transition hover:text-indigo-300"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}

              {filteredPersons.length === 0 && (
                <div className="rounded-2xl p-6 text-center text-sm text-slate-400">
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
                    className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-800/40 p-4 shadow-lg transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-800/80 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-sm font-semibold uppercase text-emerald-200">
                        {initials}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-slate-100">
                          {user.name ?? "—"}
                        </div>
                        <div className="text-sm text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                      <span
                        className={`rounded-full border px-3 py-1 ${
                          resolvedRole === "admin"
                            ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-200"
                            : "border-slate-600/40 bg-slate-700/40 text-slate-300"
                        }`}
                      >
                        {resolvedRole}
                      </span>

                      <form action={setUserRole} className="inline-flex">
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={resolvedRole === "admin" ? "user" : "admin"}
                        />
                        <button
                          type="submit"
                          className={`rounded-full border px-3 py-1 transition ${
                            resolvedRole === "admin"
                              ? "border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                          }`}
                          title={
                            resolvedRole === "admin"
                              ? "Revoke admin"
                              : "Grant admin"
                          }
                        >
                          {resolvedRole === "admin" ? "Revoke" : "Grant"}
                        </button>
                      </form>

                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-red-400 transition hover:bg-red-400/20"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="rounded-2xl p-6 text-center text-sm text-slate-400">
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
      </div>
    </div>
  );
}
