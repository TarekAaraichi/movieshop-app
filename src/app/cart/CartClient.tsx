"use client";
import React, { useEffect, useState } from "react";

type Movie = {
  id: string;
  title: string;
  imageUrl?: string | null;
  price: number | string;
  genres?: any[];
};

export default function CartClient() {
  const [items, setItems] = useState<{ movie: Movie; quantity: number }[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/cart");
    const json = await res.json();
    setItems(json.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function update(movieId: string, action: "inc" | "dec" | "remove") {
    setLoading(true);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, action }),
    });
    await load();
  }

  const total = items.reduce(
    (s, it) => s + Number(it.movie.price) * it.quantity,
    0
  );

  if (loading && items.length === 0)
    return <p className="text-gray-600">Loading...</p>;

  if (items.length === 0)
    return <p className="text-gray-600">Your cart is empty.</p>;

  return (
    <div className="space-y-4">
      {items.map(({ movie, quantity }) => (
        <div
          key={movie.id}
          className="flex items-center justify-between border-b pb-4"
        >
          <div className="flex items-center space-x-4">
            <img
              src={movie.imageUrl || "https://via.placeholder.com/80"}
              alt={movie.title}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div>
              <h2 className="text-lg font-semibold text-blue-500">
                {movie.title}
              </h2>
              <p className="text-sm text-gray-500">
                Category: {movie.genres?.[0]?.genre?.name ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-lg font-medium text-gray-800">
              ${Number(movie.price).toFixed(2)}
            </p>
            <button
              onClick={() => update(movie.id, "dec")}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              −
            </button>
            <span className="px-3">{quantity}</span>
            <button
              onClick={() => update(movie.id, "inc")}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              +
            </button>
            <button
              onClick={() => update(movie.id, "remove")}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

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
