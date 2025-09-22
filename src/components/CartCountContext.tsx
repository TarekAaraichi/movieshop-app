"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartCountContext = createContext(
  undefined as
    | {
        count: number;
        setCount: (n: number) => void;
        increment: () => void;
      }
    | undefined
);

export function CartCountProvider({
  children,
  initialCount = 0,
}: {
  children: React.ReactNode;
  initialCount?: number;
}) {
  const [count, setCount] = useState(initialCount);
  const increment = () => {
    setCount((c) => {
      const nc = c + 1;
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent("cart:updated", { detail: { count: nc } })
        );
      }
      return nc;
    });
  };

  useEffect(() => {
    // Register listener immediately so we don't miss optimistic updates
    let mounted = true;
    const onUpdate = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ count: number }>;
        if (typeof ce?.detail?.count === "number") {
          // Defer state update to avoid React "setState during render" warnings
          Promise.resolve().then(() => {
            try {
              setCount(ce.detail.count);
            } catch {}
          });
        }
      } catch {}
    };
    window.addEventListener("cart:updated", onUpdate as EventListener);

    (async () => {
      try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        type FetchedItem = { quantity?: number };
        const total = Array.isArray(data.items)
          ? data.items.reduce(
              (sum: number, it: FetchedItem) => sum + (it.quantity || 0),
              0
            )
          : 0;
        setCount(total);
      } catch {}
    })();

    return () => {
      mounted = false;
      window.removeEventListener("cart:updated", onUpdate as EventListener);
    };
  }, []);

  return (
    <CartCountContext.Provider value={{ count, setCount, increment }}>
      {children}
    </CartCountContext.Provider>
  );
}

export function useCartCount() {
  const ctx = useContext(CartCountContext);
  if (!ctx)
    throw new Error("useCartCount must be used within CartCountProvider");
  return ctx;
}
