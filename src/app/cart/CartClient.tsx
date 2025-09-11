"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateCart } from '@/app/actions/cart';
import type { CartClientItem } from '@/types';

export default function CartClient({ initialItems }: { initialItems?: CartClientItem[] }) {
  const [items] = useState<CartClientItem[]>(initialItems || []);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // After a server action form submission we can't directly await the action here,
  // so trigger a router refresh to re-fetch server-rendered data. We start a transition
  // so React shows pending UI where used.
  function onAction() {
    startTransition(() => {
      // small timeout to let the server action run; router.refresh will get updated data
      setTimeout(() => router.refresh(), 100);
    });
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
    <div className="space-y-4">
      {items.map(({ movie, quantity }) => {
        const genreNames = (movie.genres || [])
          .map((g) => g?.genre?.name)
          .filter(Boolean)
          .slice(0, 3);

        const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
        const runtime = movie.runtime ? `${movie.runtime} min` : null;
        const rating = typeof movie.rating === 'number' ? movie.rating.toFixed(1) : '—';

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
                  {genreNames.length > 0 ? genreNames.join(', ') : '—'}
                  {year ? ` · ${year}` : ''}
                  {runtime ? ` · ${runtime}` : ''}
                </p>
                <p className="text-xs text-gray-400">Rating: {rating}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-lg font-medium text-gray-800">
                ${Number(movie.price).toFixed(2)}
              </p>
              <form action={updateCart} method="post" onSubmit={onAction}>
                <input type="hidden" name="movieId" value={movie.id} />
                <button name="action" value="dec" className="px-2 py-1 bg-gray-200 rounded" disabled={isPending}>−</button>
              </form>
              <span className="px-3">{quantity}</span>
              <form action={updateCart} method="post" onSubmit={onAction}>
                <input type="hidden" name="movieId" value={movie.id} />
                <button name="action" value="inc" className="px-2 py-1 bg-gray-200 rounded" disabled={isPending}>+</button>
              </form>
              <form action={updateCart} method="post" onSubmit={onAction}>
                <input type="hidden" name="movieId" value={movie.id} />
                <button name="action" value="remove" className="text-red-500 hover:text-red-700 font-medium" disabled={isPending}>Remove</button>
              </form>
            </div>
          </div>
        );
      })}

      <div className="mt-6 flex justify-between items-center">
        <p className="text-lg font-semibold text-gray-800">
          Total: ${total.toFixed(2)}
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Checkout
        </button>
      </div>
    </div>
  );
}
