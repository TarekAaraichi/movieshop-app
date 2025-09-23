"use client";

/**
 * AddToCartClientButton
 * Client-side button that adds an item to the cart using the `useCart` hook.
 */

// - Client-only button that uses `useCart()` to perform an optimistic add
//   to the cart. Shows a spinner while pending and uses `sonner` for toasts.
// - Props: `movieId`, optional `disabled`, `className` for wrapper, and
//   `buttonClassName` to allow pages to style the native <button>.
import { useTransition } from "react";
import { useCart } from "@/hooks";
import { toast } from "sonner";

export default function AddToCartClientButton({
  movieId,
  disabled,
  className,
  buttonClassName,
}: {
  movieId: string;
  disabled?: boolean;
  // optional class for outer wrapper div
  className?: string;
  // optional class to apply to the <button> so parent can override background/spacing
  buttonClassName?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { add } = useCart();

  async function handleAdd() {
    startTransition(async () => {
      try {
        const ok = await add(movieId, 1);
        if (!ok) throw new Error("add_failed");
        toast.success("Added to cart!", {
          position: "bottom-right",
          dismissible: true,
          duration: 2000,
        });
      } catch {
        toast.error("Failed to add to cart.", {
          position: "bottom-right",
          dismissible: true,
          duration: 2000,
        });
      }
    });
  }

  if (disabled) {
    return (
      <div className={className ?? "flex flex-col items-start"}>
        <button
          type="button"
          disabled
          className={`w-full bg-gray-600 text-white py-2 px-4 rounded-md shadow disabled:opacity-60 flex items-center justify-center gap-2 cursor-not-allowed ${
            buttonClassName ?? ""
          }`}
          aria-disabled="true"
        >
          Archived
        </button>
      </div>
    );
  }

  return (
    <div className={className ?? ""}>
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending}
        aria-label={isPending ? "Adding to cart" : "Add to cart"}
        className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 ${
          buttonClassName ?? ""
        }`}
      >
        {isPending ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 animate-spin mr-2"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Adding...</span>
          </>
        ) : (
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
        )}
      </button>
    </div>
  );
}
