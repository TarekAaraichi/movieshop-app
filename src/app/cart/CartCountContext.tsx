"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartCountContext = createContext<
  | {
      count: number;
      setCount: (n: number) => void;
      increment: () => void;
    }
  | undefined
>(undefined);

export function CartCountProvider({ children, initialCount = 0 }: { children: React.ReactNode; initialCount?: number }) {
  const [count, setCount] = useState(initialCount);
  const increment = () => setCount((c) => c + 1);

  // On mount, sync count with cart cookie
  useEffect(() => {
    try {
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('cart='));
      if (cookie) {
        const cart = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        const total = Array.isArray(cart)
          ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0)
          : 0;
        setCount(total);
      }
    } catch {}
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
