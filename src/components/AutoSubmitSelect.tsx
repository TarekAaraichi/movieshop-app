"use client";

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
      className={`p-2 border border-gray-300 rounded bg-white text-gray-800 ${className}`}
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
