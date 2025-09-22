"use client";
import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// ...existing code... (cart updates now use /api/cart endpoint)
import type { CartClientItem } from "@/types";
import { useCart } from "@/hooks";
import { useCartCount } from "@/components";

export default function CartClient({
  initialItems,
}: {
  initialItems?: CartClientItem[];
}) {
  const { items, update, add, remove, revalidate } = useCart(
    initialItems || []
  );
  const { setCount } = useCartCount();

  // Sync count on mount and when items change
  useEffect(() => {
    setCount(
      items.reduce((sum: number, it: CartClientItem) => sum + it.quantity, 0)
    );
  }, [items, setCount]);

  useEffect(() => {
    // if server provided initialItems, ensure hook revalidates
    revalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialItems]);
  const [isPending, startTransition] = useTransition();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  // After a server action form submission, trigger a router refresh to re-fetch server-rendered data.
  function onAction() {
    startTransition(() => {
      // Refresh the current route so server components re-fetch data
      // and reflect the cookie change made by the server action.
      // A tiny timeout can help ensure the response has been processed,
      // but router.refresh() is the important change here.
      setTimeout(() => {
        router.refresh();
      }, 80);
    });
  }

  // Reset the explicit checkout flag when transitions finish.
  useEffect(() => {
    if (!isPending && isCheckingOut) setIsCheckingOut(false);
  }, [isPending, isCheckingOut]);

  // Client-side updates are handled by the shared `useCart` hook which
  // performs optimistic updates and server persistence via /api/cart.

  const total = items.reduce(
    (s: number, it: CartClientItem) => s + Number(it.movie.price) * it.quantity,
    0
  );

  if (isPending && items.length === 0)
    return <p className="text-gray-600">Loading...</p>;

  if (items.length === 0)
    return <p className="text-gray-600">Your cart is empty.</p>;

  return (
    <div className="space-y-4 text-gray-900">
      {items.map(({ movie, quantity }: CartClientItem) => {
        const genreNames = (
          movie.genres || ([] as unknown as { genre?: { name?: string } }[])
        )
          .map(
            (g: { genre?: { name?: string } } | null | undefined) =>
              g?.genre?.name
          )
          .filter(Boolean)
          .slice(0, 3);

        const year = movie.releaseDate
          ? new Date(movie.releaseDate).getFullYear()
          : null;
        const runtime = movie.runtime ? `${movie.runtime} min` : null;
        const rating =
          typeof movie.rating === "number" ? movie.rating.toFixed(1) : "—";

        return (
          <div
            key={movie.id}
            className="flex items-center justify-between border-b pb-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 relative">
                <Image
                  src={movie.imageUrl || "https://via.placeholder.com/80"}
                  alt={movie.title}
                  fill
                  sizes="80px"
                  className="object-cover rounded-md"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-500">
                  {movie.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {genreNames.length > 0 ? genreNames.join(", ") : "—"}
                  {year ? ` · ${year}` : ""}
                  {runtime ? ` · ${runtime}` : ""}
                </p>
                <p className="text-xs text-gray-400">Rating: {rating}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-lg font-medium text-gray-800">
                ${Number(movie.price).toFixed(2)}
              </p>
              <button
                onClick={async () => {
                  // optimistic handled inside hook
                  await update(movie.id, quantity - 1);
                  onAction();
                }}
                className="px-2 py-1 bg-gray-200 rounded"
                disabled={isPending}
              >
                −
              </button>
              <span className="px-3">{quantity}</span>
              <button
                onClick={async () => {
                  await add(movie.id, 1);
                  onAction();
                }}
                className="px-2 py-1 bg-gray-200 rounded"
                disabled={isPending}
              >
                +
              </button>
              <button
                onClick={async () => {
                  await remove(movie.id);
                  onAction();
                }}
                className="text-red-500 hover:text-red-700 font-medium"
                disabled={isPending}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <div className="mt-6 flex justify-between items-center">
        <p className="text-lg font-semibold text-gray-800">
          Total: ${total.toFixed(2)}
        </p>
        <button
          type="button"
          onClick={() => {
            // Mark that this transition is a checkout so we can show the
            // appropriate label. Other transitions (cart updates) will not
            // set this flag and will instead display "Updating...".
            setIsCheckingOut(true);
            startTransition(() => {
              router.push("/checkout");
            });
          }}
          disabled={isPending}
          className={`px-6 py-2 text-white rounded-md disabled:opacity-50 ${
            isPending
              ? "bg-blue-400 hover:bg-blue-400 cursor-wait"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isPending
            ? isCheckingOut
              ? "Checking out..."
              : "Updating..."
            : "Checkout"}
        </button>
      </div>
    </div>
  );
}
