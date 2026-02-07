"use client";

import AutoSubmitSelect from "./AutoSubmitSelect";

interface YearFilterProps {
  years: number[];
  currentYear?: number;
}

export function YearFilter({ years, currentYear }: YearFilterProps) {
  const yearOptions = years.map((y) => ({
    value: String(y),
    label: String(y),
  }));

  return (
    <div className="mb-6 flex justify-end items-center gap-2">
      <label
        htmlFor="year-filter"
        className="text-sm text-neutral-600 dark:text-neutral-400"
      >
        Filter by year:
      </label>
      <AutoSubmitSelect
        id="year-filter"
        name="year"
        value={currentYear ? String(currentYear) : ""}
        options={yearOptions}
        ariaLabel="Filter orders by year"
        placeholder="All years"
      />
    </div>
  );
}
