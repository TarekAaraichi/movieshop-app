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
  /**
   * Debounce duration (ms) before triggering navigation after user types.
   * Defaults to 350ms.
   */
  debounceMs?: number;
  /**
   * @deprecated autoNavigateOnEmpty is now implicit; kept for backwards compat.
   */
  autoNavigateOnEmpty?: boolean;
};

export default function MovieSearch({
  initialQuery = "",
  selectedGenre = "",
  debounceMs = 350,
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
    [router, selectedGenre],
  );

  // Debounced navigation on value change (reactive search)
  React.useEffect(() => {
    // If empty and autoNavigateOnEmpty -> navigate to base (retain genre if present)
    if (value === "" && autoNavigateOnEmpty) {
      const t = setTimeout(
        () => navigate(undefined),
        Math.min(250, debounceMs),
      );
      return () => clearTimeout(t);
    }
    // Otherwise debounce navigate with current value
    const trimmed = value.trim();
    const t = setTimeout(
      () => navigate(trimmed === "" ? undefined : trimmed),
      debounceMs,
    );
    return () => clearTimeout(t);
  }, [value, selectedGenre, debounceMs, autoNavigateOnEmpty, navigate]);

  return (
    <div className="relative flex-1 w-full md:w-auto">
      <input
        id="movie-search"
        name="q"
        type="search"
        aria-label="Search by title, actor or director"
        placeholder="Search by title, actor, or director..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-card border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neutral-500"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-muted"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
