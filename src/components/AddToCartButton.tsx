"use client";

/**
 * AddToCartButton
 * Reusable button component used to render add-to-cart actions; accepts styling props.
 */

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

export default function AddToCartButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={`w-full py-2 px-4 rounded-md shadow flex items-center justify-center gap-2 ${
        disabled
          ? "bg-card text-muted cursor-not-allowed opacity-60"
          : "btn-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path
          d="M3 3h2l.4 2M7 13h10l3-8H6.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>

      {disabled ? "Archived" : pending ? "Adding…" : "Add to Cart"}
    </Button>
  );
}
