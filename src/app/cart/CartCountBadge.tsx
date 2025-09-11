"use client";
import { useCartCount } from "@/app/cart/CartCountContext";

export default function CartCountBadge() {
  const { count } = useCartCount();
  if (count <= 0) return null;
  return (
    <span className="ml-1 inline-block bg-teal-500 text-white text-xs font-bold rounded-full px-2 py-0.5 align-top">
      {count}
    </span>
  );
}
