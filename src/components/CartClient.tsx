"use client";

/**
 * CartClient
 * Client-side cart UI component that renders the current cart and supports client actions.
 */

// CartClient (client component)
// - Renders the interactive cart UI on `/cart` using the `useCart` hook.
// - Handles optimistic increments/decrements and navigation to checkout.
// - Avoids forced `router.refresh()` during mutations to prevent overwriting
//   optimistic updates.
import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { CartClientItem } from "@/types";
import { useCartCount } from "@/components";
import { useCart } from "@/hooks";

export default function CartClient({
  initialItems,
}: {
  initialItems?: CartClientItem[];
}) {
  // Use the client-side cart hook which posts to /api/cart
  const { items, add, update, remove } = useCart(initialItems || []);
  const { setCount } = useCartCount();
  const [isPending, startTransition] = useTransition();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  function onAction() {
    // Intentionally no-op: optimistic updates and the `useCart` hook's
    // revalidation will keep client state in sync with the server.
    // Avoid calling `router.refresh()` here because it triggers a server
    // render before the POST mutation completes and can cause the UI to
    // briefly revert to the server's (stale) state.
  }

  useEffect(() => {
    if (!isPending && isCheckingOut) setIsCheckingOut(false);
  }, [isPending, isCheckingOut]);

  // Keep global count in sync and ensure we have authoritative state from server
  useEffect(() => {
    setCount(
      items.reduce((sum: number, it: CartClientItem) => sum + it.quantity, 0)
    );
    // Do not call `revalidate()` here. Revalidation is performed by the
    // mutate flow (mutateServer) after the POST completes to avoid races
    // where a background GET could return stale server state and overwrite
    // the optimistic update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Items are updated by the `useCart` hook; keep a local revalidation helper
  async function onInc(movieId: string) {
    // optimistic update handled in hook
    await add(movieId, 1);
    onAction();
  }

  async function onDec(movieId: string) {
    // optimistic update handled in hook
    // find current quantity
    const cur = items.find((i) => i.movie.id === movieId)?.quantity ?? 0;
    await update(movieId, Math.max(0, cur - 1));
    onAction();
  }

  async function onRemove(movieId: string) {
    await remove(movieId);
    onAction();
  }

  const total = items.reduce(
    (s, it) => s + Number(it.movie.price) * it.quantity,
    0
  );

  if (isPending && items.length === 0)
    return <p className="text-gray-600">Loading...</p>;

  if (items.length === 0)
    return <p className="text-gray-600">Your cart is empty.</p>;

  return (
    <div className="space-y-4 text-gray-900">
      {items.map(({ movie, quantity }) => {
        const genreNames = (movie.genres || [])
          .map((g) => g?.genre?.name)
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
                type="button"
                onClick={() => onDec(movie.id)}
                className="px-2 py-1 bg-gray-200 rounded"
                disabled={isPending}
              >
                −
              </button>
              <span className="px-3">{quantity}</span>
              <button
                type="button"
                onClick={() => onInc(movie.id)}
                className="px-2 py-1 bg-gray-200 rounded"
                disabled={isPending}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => onRemove(movie.id)}
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
