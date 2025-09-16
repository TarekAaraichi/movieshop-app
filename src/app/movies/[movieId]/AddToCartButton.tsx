// src/app/movies/[movieId]/AddToCartButton.tsx
"use client";
import { useFormStatus } from "react-dom";

export default function AddToCartButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
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

      {pending ? "Adding…" : "Add to Cart"}
    </button>
  );
}
