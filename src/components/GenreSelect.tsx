"use client";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  selectedGenre?: string;
  query?: string;
  options?: string[];
};

export default function GenreSelect({
  selectedGenre = "",
  query = "",
  options = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi"],
}: Props) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (value) params.set("genre", value);
    const url = `/movies?${params.toString()}`;
    router.push(url);
  };

  return (
    <select
      name="genre"
      aria-label="Filter by genre"
      className="p-2 rounded-lg border border-gray-500 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
      value={selectedGenre}
      onChange={handleChange}
    >
      <option value="">Filter by genre</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
