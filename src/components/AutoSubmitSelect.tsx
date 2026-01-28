"use client";

/**
 * AutoSubmitSelect
 * Select input that auto-submits its value on change (used in filters/pagination).
 */

import React from "react";

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
  return (
    <select
      aria-label={ariaLabel}
      name={name}
      defaultValue={value}
      onChange={(e) => {
        const form = (e.target as HTMLSelectElement)
          .form as HTMLFormElement | null;
        if (form) form.requestSubmit();
      }}
      className={`p-2 border border-gray-700 rounded bg-gray-900 text-gray-100 ${className}`}
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
