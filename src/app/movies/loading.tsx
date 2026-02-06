"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTheme } from "@/components/PageThemeContext";
import React from "react";

function MovieCardSkeleton() {
  const { theme } = usePageTheme();
  const skeletonBg = theme === "dark" ? "bg-neutral-800" : "bg-neutral-200";
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className={`h-82.5 w-full rounded-xl ${skeletonBg}`} />
      <div className="space-y-2">
        <Skeleton className={`h-4 w-full ${skeletonBg}`} />
        <Skeleton className={`h-4 w-2/3 ${skeletonBg}`} />
      </div>
    </div>
  );
}

export default function Loading() {
  // Ensure theme context is available
  return (
    <React.Suspense fallback={null}>
      <div className="min-h-60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </React.Suspense>
  );
}
