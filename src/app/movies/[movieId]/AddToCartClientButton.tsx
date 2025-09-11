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
        toast.success("Added to cart!");
      } catch (err) {
        toast.error("Failed to add to cart.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add to Cart"}
      </button>
    </div>
  );
}
