"use client";

/**
 * MovieSearch
 * Client search input with autocomplete and optional auto-navigation behavior.
 */

import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialQuery?: string;
  selectedGenre?: string;
  autoNavigateOnEmpty?: boolean;
};

export default function MovieSearch({
  initialQuery = "",
  selectedGenre = "",
  autoNavigateOnEmpty = true,
}: Props) {
  const router = useRouter();
  const [value, setValue] = React.useState(initialQuery);

  const navigate = React.useCallback(
    (q?: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (selectedGenre) params.set("genre", selectedGenre);
      const url = `/movies?${params.toString()}`;
      router.push(url);
    },
    [router, selectedGenre]
  );

  // handle Enter key
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigate(value.trim() || undefined);
    }
  };

  // when user clears input, auto-navigate to apply genre-only filter
  React.useEffect(() => {
    if (value === "" && autoNavigateOnEmpty) {
      // small timeout to allow user to continue typing; if truly empty, navigate
      const t = setTimeout(() => navigate(undefined), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [value, navigate, autoNavigateOnEmpty]);

  return (
    <div className="flex items-center w-full">
      <input
        name="q"
        type="search"
        aria-label="Search by title, actor or director"
        placeholder="Search by title, actor, or director...🔍"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        className="p-2 w-full sm:w-64 rounded-lg border border-gray-500 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
      />
      <button
        type="button"
        onClick={() => navigate(value.trim() || undefined)}
        className="ml-3 px-3 py-2 rounded-lg bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        Search
      </button>
    </div>
  );
}
