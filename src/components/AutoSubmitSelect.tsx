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
  id,
  placeholder,
}: {
  name: string;
  value?: string;
  options: { value: string; label: string }[];
  className?: string;
  ariaLabel?: string;
  id?: string;
  placeholder?: string;
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
    // Reset page to 1 when filter changes
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      id={id}
      aria-label={ariaLabel}
      name={name}
      defaultValue={value}
      onChange={handleChange}
      className={`p-2 rounded-lg border bg-card text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-neutral-500 border-border ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
