import React from "react";
import { Button } from "@/components/ui";

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
        <Button
          key={star}
          type="button"
          variant="ghost"
          size="sm"
          className={`text-xl p-1 ${star <= rating ? "text-yellow-400" : "text-muted"}`}
          onClick={() => onRate && onRate(star)}
          disabled={disabled}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </Button>
      ))}
    </div>
  );
}
