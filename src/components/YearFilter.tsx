"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface YearFilterProps {
  years: number[];
  currentYear?: number;
}

export function YearFilter({ years, currentYear }: YearFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    const url = year ? `?year=${year}` : "/profile/orders";
    startTransition(() => {
      router.push(url);
    });
  };

  return (
    <form method="get" className="mb-6 flex items-center gap-2">
      <label htmlFor="year" className="text-sm text-gray-500">
        Filter by year:
      </label>
      <select
        id="year"
        name="year"
        className="bg-linear-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 text-white rounded px-3 py-1 text-sm border border-gray-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        value={currentYear ?? ""}
        onChange={handleChange}
        disabled={isPending}
      >
        <option value="">All years</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </form>
  );
}
