"use client";
import React, { createContext, useContext, useState } from "react";

const CartCountContext = createContext<{
  count: number;
  setCount: (n: number) => void;
  increment: () => void;
} | undefined>(undefined);

export function CartCountProvider({ children, initialCount = 0 }: { children: React.ReactNode; initialCount?: number }) {
  const [count, setCount] = useState(initialCount);
  const increment = () => setCount((c) => c + 1);
  return (
    <CartCountContext.Provider value={{ count, setCount, increment }}>
      {children}
    </CartCountContext.Provider>
  );
}

export function useCartCount() {
  const ctx = useContext(CartCountContext);
  if (!ctx) throw new Error("useCartCount must be used within CartCountProvider");
  return ctx;
}
