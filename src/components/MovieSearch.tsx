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
    [router, selectedGenre]
  );

  // Debounced navigation on value change (reactive search)
  React.useEffect(() => {
    // If empty and autoNavigateOnEmpty -> navigate to base (retain genre if present)
    if (value === "" && autoNavigateOnEmpty) {
      const t = setTimeout(
        () => navigate(undefined),
        Math.min(250, debounceMs)
      );
      return () => clearTimeout(t);
    }
    // Otherwise debounce navigate with current value
    const trimmed = value.trim();
    const t = setTimeout(
      () => navigate(trimmed === "" ? undefined : trimmed),
      debounceMs
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
        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
    </div>
    
  );
}
