import React from "react";

interface MovieRatingStarsProps {
  rating: number;
  onRate?: (rating: number) => void;
  disabled?: boolean;
}

export function MovieRatingStars({
  rating,
  onRate,
  disabled,
}: MovieRatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-xl ${star <= rating ? "text-yellow-400" : "text-muted"}`}
          onClick={() => onRate && onRate(star)}
          disabled={disabled}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
