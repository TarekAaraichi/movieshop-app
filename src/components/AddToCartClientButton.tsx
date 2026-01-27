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
import toast from "react-hot-toast";

export default function AddToCartClientButton({
  movieId,
  stock,
  disabled,
  className,
  buttonClassName,
}: {
  movieId: string;
  stock?: number | null;
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
        const ok = await add(movieId, 1, stock);
        if (!ok) throw new Error("add_failed");
        toast.success("Added to cart!");
      } catch {
        toast.error("Failed to add to cart.");
      }
    });
  }

  const effectiveDisabled =
    disabled || (stock !== null && stock !== undefined ? stock === 0 : false);

  if (effectiveDisabled) {
    return (
      <div className={className ?? "flex flex-col items-start"}>
        <button
          type="button"
          disabled
          className={`w-full bg-gray-600 text-white py-2 px-4 rounded-md shadow disabled:opacity-60 flex items-center justify-center gap-2 cursor-not-allowed ${
            buttonClassName ?? ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>{stock === 0 ? "Out of stock" : "Add to cart"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={className ?? "flex flex-col items-start"}>
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending}
        className={`w-full flex items-center justify-center gap-2 ${
          buttonClassName ?? ""
        }`}
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Adding...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Add to cart</span>
          </>
        )}
      </button>
    </div>
  );
}
