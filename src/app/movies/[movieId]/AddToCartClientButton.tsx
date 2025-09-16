"use client";
import { useTransition } from "react";
import { useCartCount } from "@/app/cart/CartCountContext";
import { addToCart } from "@/app/actions/movies";
import { toast } from "sonner";

export default function AddToCartClientButton({
  movieId,
}: {
  movieId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { increment } = useCartCount();

  async function handleAdd() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("movieId", movieId);
      try {
        await addToCart(formData);
        increment();
        toast.success("Added to cart!", {
          position: "bottom-right",
          dismissible: true,
          duration: 2000,
          action: {
            label: "X",
            onClick: () => toast.dismiss(),
          },
        });
      } catch {
        toast.error("Failed to add to cart.", {
          position: "bottom-right",
          dismissible: true,
          duration: 2000,
          action: {
            label: "X",
            onClick: () => toast.dismiss(),
          },
        });
      }
    });
  }

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? "Adding…" : "Add to Cart"}
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
      </button>
    </div>
  );
}
