"use client";

import { useEffect } from "react";
import { useCartCount } from "@/app/cart/CartCountContext";

export default function ClearCartOnConfirmation() {
  const { setCount } = useCartCount();

  useEffect(() => {
    try {
      // Clear cart cookie
      document.cookie = `cart=; path=/; max-age=0`;
    } catch {}
    // Reset context count
    try {
      setCount(0);
    } catch {}
  }, [setCount]);

  return null;
}
