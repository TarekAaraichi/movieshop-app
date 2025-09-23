"use client";

/**
 * clearCartOnConfirmation
 * Client-side helper that clears the cart when an external confirmation event occurs.
 */

import { useEffect } from "react";
import { useCartCount } from "@/components";

export default function ClearCartOnConfirmation() {
  const { setCount } = useCartCount();

  useEffect(() => {
    (async () => {
      try {
        // First try server-side authoritative clear so DB/cart rows are removed
        const res = await fetch("/api/cart", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "clear" }),
        });
        if (res && res.ok) {
          const dto = await res.json();
          const total = Array.isArray(dto.items)
            ? dto.items.reduce(
                (s: number, it: { quantity?: number }) =>
                  s + (it.quantity || 0),
                0
              )
            : 0;
          try {
            setCount(total);
          } catch {}
          try {
            if (typeof window !== "undefined" && window.dispatchEvent) {
              window.dispatchEvent(
                new CustomEvent("cart:updated", { detail: { count: total } })
              );
              window.dispatchEvent(new CustomEvent("cart:revalidate"));
            }
          } catch {}
          return;
        }
      } catch {}
      // Fallback: clear client cookie and broadcast zero
      try {
        document.cookie = `cart=; path=/; max-age=0`;
      } catch {}
      try {
        setCount(0);
      } catch {}
      try {
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent("cart:updated", { detail: { count: 0 } })
          );
          window.dispatchEvent(new CustomEvent("cart:revalidate"));
        }
      } catch {}
    })();
  }, [setCount]);

  return null;
}
