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
    <div className="flex items-center w-full">
      <input
        id="movie-search"
        name="q"
        type="search"
        aria-label="Search by title, actor or director"
        placeholder="Search by title, actor, or director..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-transparent px-4 py-3 text-base text-gray-200 placeholder-gray-400 focus:outline-none caret-teal-300"
      />
    </div>
  );
}
