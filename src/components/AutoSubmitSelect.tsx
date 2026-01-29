"use client";

/**
 * AutoSubmitSelect
 * Select input that auto-submits its value on change (used in filters/pagination).
 */

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AutoSubmitSelect({
  name,
  value,
  options,
  className = "",
  ariaLabel,
}: {
  name: string;
  value?: string;
  options: { value: string; label: string }[];
  className?: string;
  ariaLabel?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const term = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set(name, term);
    } else {
      params.delete(name);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      aria-label={ariaLabel}
      name={name}
      defaultValue={value}
      onChange={handleChange}
      className={`p-2 border border-gray-700 rounded-lg bg-neutral-800 text-gray-100 ${className}`}
    >
      <option value="">All</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
