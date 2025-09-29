"use client";
import React from "react";
import type { CartClientItem } from "@/types";

interface Props {
  initialItems: CartClientItem[];
}

export default function CheckoutSecureButton({ initialItems }: Props) {
  const [items, setItems] = React.useState<CartClientItem[]>(initialItems);
  const [navigating, setNavigating] = React.useState(false);
  React.useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<CartClientItem[]>).detail;
      if (Array.isArray(detail)) setItems(detail);
    }
    window.addEventListener("cart:items-changed", handler as EventListener);
    return () =>
      window.removeEventListener(
        "cart:items-changed",
        handler as EventListener
      );
  }, []);

  const disabled = items.length === 0 || navigating;
  const onClick = () => {
    if (disabled) return;
    setNavigating(true);
    window.location.href = "/checkout";
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full inline-flex justify-center items-center px-4 py-3 rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 transition ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:from-blue-700 hover:to-indigo-700"
      }`}
    >
      {navigating ? "Redirecting..." : "Checkout securely"}
    </button>
  );
}
