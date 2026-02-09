"use client";
import React from "react";
import { Button } from "@/components/ui";
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
        handler as EventListener,
      );
  }, []);

  const disabled = items.length === 0 || navigating;
  const onClick = () => {
    if (disabled) return;
    setNavigating(true);
    window.location.href = "/checkout";
  };
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full inline-flex justify-center items-center px-4 py-3 rounded-md text-white bg-blue-600 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-blue-700 dark:hover:bg-blue-500"
      }`}
    >
      {navigating ? "Redirecting..." : "Checkout securely"}
    </Button>
  );
}
