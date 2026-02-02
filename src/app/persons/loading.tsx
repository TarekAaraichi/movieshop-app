"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTheme } from "@/components/PageThemeContext";
import React from "react";

function PersonCardSkeleton() {
  const { theme } = usePageTheme();
  const skeletonBg = theme === "dark" ? "bg-neutral-800" : "bg-neutral-200";
  return (
    <div className="flex flex-col items-center space-y-3">
      <Skeleton className={`h-32 w-32 rounded-full ${skeletonBg}`} />
      <div className="space-y-2 w-full">
        <Skeleton className={`h-4 w-3/4 mx-auto ${skeletonBg}`} />
        <Skeleton className={`h-4 w-1/2 mx-auto ${skeletonBg}`} />
      </div>
    </div>
  );
}

export default function Loading() {
  // Ensure theme context is available
  return (
    <React.Suspense fallback={null}>
      <div className="min-h-[240px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <PersonCardSkeleton key={i} />
        ))}
      </div>
    </React.Suspense>
  );
}
