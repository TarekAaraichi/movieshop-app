"use client";
import React, { useState } from "react";
import { MovieRatingStars } from "@/components/MovieRatingStars";

interface OrderMovieRatingClientProps {
  movieId: string;
  initialRating: number;
  disabled?: boolean;
  onRateServer: (movieId: string, rating: number) => Promise<void>;
}

export function OrderMovieRatingClient({
  movieId,
  initialRating,
  disabled,
  onRateServer,
}: OrderMovieRatingClientProps) {
  const [rating, setRating] = useState(initialRating);
  const [loading, setLoading] = useState(false);

  async function handleRate(r: number) {
    setLoading(true);
    await onRateServer(movieId, r);
    setRating(r);
    setLoading(false);
  }

  return (
    <div className="mt-2">
      <MovieRatingStars
        rating={rating}
        onRate={handleRate}
        disabled={disabled || loading}
      />
      {loading && <span className="ml-2 text-xs text-gray-400">Saving...</span>}
    </div>
  );
}
