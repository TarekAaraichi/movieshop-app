"use client";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function PersonCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-62.5 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      <div className="p-2 space-y-2">
        <Skeleton className="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <PersonCardSkeleton key={i} />
      ))}
    </div>
  );
}
