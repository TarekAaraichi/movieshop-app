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
      className={`w-full inline-flex justify-center items-center px-4 py-3 rounded-md bg-primary text-primary-foreground shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
      }`}
    >
      {navigating ? "Redirecting..." : "Checkout securely"}
    </Button>
  );
}
