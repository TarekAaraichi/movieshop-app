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
import React, { useEffect } from "react";
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
  const isPending = false; // simplified: parent no longer triggers transitions here

  function onAction() {
    // Intentionally no-op: optimistic updates and the `useCart` hook's
    // revalidation will keep client state in sync with the server.
    // Avoid calling `router.refresh()` here because it triggers a server
    // render before the POST mutation completes and can cause the UI to
    // briefly revert to the server's (stale) state.
  }

  // no local checkout state; checkout handled by parent secure button

  // Keep global count in sync and ensure we have authoritative state from server
  useEffect(() => {
    setCount(
      items.reduce((sum: number, it: CartClientItem) => sum + it.quantity, 0),
    );
    // Broadcast cart item changes for other client components (e.g., order summary, checkout button)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:items-changed", { detail: items }),
      );
    }
    // Do not call `revalidate()` here. Revalidation is performed by the
    // mutate flow (mutateServer) after the POST completes to avoid races
    // where a background GET could return stale server state and overwrite
    // the optimistic update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Items are updated by the `useCart` hook; keep a local revalidation helper
  async function onInc(movieId: string, stock: number | null = null) {
    // optimistic update handled in hook
    await add(movieId, 1, stock);
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

  // If we later reintroduce transitions, restore isPending logic
  if (isPending && items.length === 0)
    return <p className="text-gray-600">Loading...</p>;
  if (items.length === 0)
    return <p className="text-gray-600">Your cart is empty.</p>;

  return (
    <div className="space-y-4 text-gray-100">
      {items.map(({ movie, quantity }) => {
        type MaybeGenre = { genre?: { name?: string }; name?: string };
        const genreNames = (
          (movie.genres as unknown as MaybeGenre[] | undefined) || []
        )
          .map((g) => g?.genre?.name || g?.name)
          .filter(Boolean)
          .slice(0, 3);
        // (year, runtime, rating omitted from cart row to keep layout compact)

        return (
          <div
            key={movie.id}
            className="flex items-center justify-between border-b pb-4"
          >
            <div className="flex items-center px-2 space-x-4">
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
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-blue-500">
                    {movie.title}
                  </h2>
                  {typeof movie.stock === "number" &&
                    movie.stock > 0 &&
                    movie.stock <= 5 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-600 text-white text-xs font-semibold">
                        Only {movie.stock} left
                      </span>
                    )}
                </div>
                <p className="text-sm text-gray-500">
                  {genreNames.length > 0 ? genreNames.join(", ") : "—"}
                  <br />
                  {/* {year ? ` ${year}` : ""}
                  <br /> */}
                  {movie.runtime
                    ? (() => {
                        const h = Math.floor(movie.runtime / 60);
                        const m = movie.runtime % 60;
                        return h > 0 ? ` ${h}h ${m}m` : ` ${m}m`;
                      })()
                    : ""}
                </p>
                {/* <p className="text-xs text-gray-400">Rating: {rating}</p> */}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <p className="text-lg font-medium text-gray-800">
                SEK{Number(movie.price).toFixed(2)}
              </p>
              <button
                type="button"
                onClick={() => onDec(movie.id)}
                className="px-2 bg-gray-200 rounded"
                disabled={isPending}
              >
                −
              </button>
              <span className="px-3">{quantity}</span>
              <button
                type="button"
                onClick={() => onInc(movie.id, movie.stock ?? null)}
                className="px-2 bg-gray-200 rounded"
                disabled={
                  isPending || (movie.stock !== null && quantity >= movie.stock)
                }
              >
                +
              </button>
              {typeof movie.stock === "number" && quantity >= movie.stock && (
                <div className="text-xs text-red-600 ml-2">
                  Reached max stock
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(movie.id)}
                className="text-red-500 hover:text-red-700 font-medium"
                disabled={isPending}
              >
                Remove
              </button>
              <br />
            </div>
          </div>
        );
      })}

      {/* Checkout button removed; handled by secure button in page aside */}
    </div>
  );
}
