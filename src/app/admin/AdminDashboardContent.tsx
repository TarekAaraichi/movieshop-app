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

  // Show a one-time toast when arriving after creating an item or on error
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const created = params.get("created");
    const title = params.get("title") || params.get("name");
    const error = params.get("error");

    if (created) {
      const msg = title ? `Added "${title}"` : "Item added";
      toast.success(`${msg}!`);
      params.delete("created");
      params.delete("title");
    }

    if (error) {
      if (error === "exists") {
        const msg = title ? `"${title}" already exists` : "Item already exists";
        toast.error(msg);
      } else {
        toast.error("An error occurred");
      }
      params.delete("error");
      params.delete("name");
      params.delete("title");
    }

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
    <div className="max-w-7xl mx-auto rounded-3xl border border-gray-200 bg-zinc-900/80 shadow-sm dark:border-gray-900/70  dark:backdrop-blur">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <AdminTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

          <div
            role="search"
            className="flex flex-col gap-2 rounded-2xl  md:flex-row md:items-center md:gap-3"
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
                className="min-w-40 rounded-lg border border-gray-300 bg-zinc-900/80 p-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 dark:border-gray-700  dark:text-gray-100"
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
                className="min-w-40 rounded-lg border border-gray-300 bg-zinc-900/80 p-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 dark:border-gray-700  dark:text-gray-100"
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
                className="min-w-40 rounded-lg border border-gray-300 bg-zinc-900/80 p-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 dark:border-gray-700  dark:text-gray-100"
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
      </div>

      <div className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          {activeTab === "movies" && (
            <Link
              href="/admin/movies/create"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-indigo-400/40 dark:bg-indigo-400/20 dark:text-indigo-50 dark:hover:bg-indigo-400/30 dark:focus:ring-indigo-300/60"
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
                    className="flex flex-col justify-between gap-4 rounded-2xl border  border-gray-200 bg-gray-800 p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg"
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
                        {releaseLabel} &middot; {genreNames}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-sm">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                          {movie.price != null ? `SEK ${movie.price}` : "—"}
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
                            disabled={disableDelete}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/10 dark:disabled:border-gray-700 dark:disabled:bg-transparent dark:disabled:text-gray-500"
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
                <div className="col-span-full rounded-2xl p-6 text-center text-sm text-gray-500  dark:text-gray-400">
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
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-800 p-4 shadow-sm transition hover:border-indigo-500/40 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
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
                            .map((segment) => segment[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}
                      <div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {person.fullName}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-500">
                          {roleSummary}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                      <Link
                        href={`/admin/persons/${person.id}/edit`}
                        className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </Link>
                      {/* <button
                        type="button"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `Delete "${person.fullName}"? This is permanent.`,
                            )
                          )
                            return;
                          await deletePerson(person.id);
                          toast.success(`Deleted "${person.fullName}"`);
                        }}
                        className="font-semibold text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400"
                      >
                        Delete
                      </button> */}
                    </div>
                  </div>
                );
              })}

              {filteredPersons.length === 0 && (
                <div className="rounded-2xl p-6 text-center text-sm text-gray-500 dark:text-gray-400">
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
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-800 p-4 shadow-sm transition hover:border-indigo-500/40 hover:shadow-lg md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-semibold uppercase text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200">
                        {initials}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {user.name ?? "—"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                      <span
                        className={`rounded-full border px-3 py-1 ${
                          resolvedRole === "admin"
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-200"
                            : "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-600/40 dark:bg-gray-700/40 dark:text-gray-300"
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
                              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/10"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/10"
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
                          className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/10"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="rounded-2xl  p-6 text-center text-sm text-gray-500   dark:text-gray-400">
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
