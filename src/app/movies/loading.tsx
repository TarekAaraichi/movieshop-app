"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/PageThemeContext";
import React from "react";

function MovieCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton
        className={
          "h-[330px] w-full rounded-xl bg-gray-200 dark:bg-neutral-800"
        }
      />
      <div className="space-y-2">
        <Skeleton className={"h-4 w-full bg-gray-200 dark:bg-neutral-800"} />
        <Skeleton className={"h-4 w-2/3 bg-gray-200 dark:bg-neutral-800"} />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <Skeleton
            className={
              "h-12 w-1/3 mx-auto bg-gray-300 dark:bg-neutral-700 rounded-lg"
            }
          />
          <Skeleton
            className={
              "h-4 w-1/4 mx-auto mt-4 bg-gray-300 dark:bg-neutral-700 rounded-lg"
            }
          />
        </header>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <Skeleton
            className={
              "h-12 flex-grow bg-gray-300 dark:bg-neutral-700 rounded-lg"
            }
          />
          <Skeleton
            className={
              "h-12 w-full md:w-48 bg-gray-300 dark:bg-neutral-700 rounded-lg"
            }
          />
        </div>

        <div className="min-h-60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
