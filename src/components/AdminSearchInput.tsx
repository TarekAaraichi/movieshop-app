"use client";

import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface AdminSearchInputProps {
  placeholder?: string;
  param?: string;
  className?: string;
  inputClassName?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  syncToUrl?: boolean;
  debounceMs?: number;
}

export default function AdminSearchInput({
  placeholder = "Search...",
  param = "q",
  className = "",
  inputClassName = "",
  value,
  onValueChange,
  syncToUrl = true,
  debounceMs = 300,
}: AdminSearchInputProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [internalValue, setInternalValue] = React.useState(
    value ?? searchParams.get(param) ?? "",
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  React.useEffect(() => {
    if (value === undefined && syncToUrl) {
      setInternalValue(searchParams.get(param) ?? "");
    }
  }, [param, searchParams, syncToUrl, value]);

  const handleSearch = useDebouncedCallback((term: string) => {
    if (!syncToUrl) {
      return;
    }
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set(param, term);
    } else {
      params.delete(param);
    }
    params.delete("page");
    const query = params.toString();
    replace(query ? `${pathname}?${query}` : pathname);
  }, debounceMs);

  const handleChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
    handleSearch(nextValue);
  };

  return (
    <div className={`relative w-full md:w-auto ${className}`.trim()}>
      <input
        type="search"
        value={value !== undefined ? value : internalValue}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/70 dark:border-gray-800/70 dark:bg-gray-950/70 dark:text-gray-100 ${inputClassName}`.trim()}
        aria-label={placeholder}
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-gray-400 dark:text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
