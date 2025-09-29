"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import type { CartClientItem } from "@/types";

// Context holds current cart items for reactive summary components.
export interface CartStateValue {
  items: CartClientItem[];
  setItems: React.Dispatch<React.SetStateAction<CartClientItem[]>>;
}

const CartStateContext = createContext<CartStateValue | undefined>(undefined);

export function CartStateProvider({
  initialItems,
  children,
}: {
  initialItems: CartClientItem[];
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartClientItem[]>(initialItems);
  const value = useMemo(() => ({ items, setItems }), [items]);
  return (
    <CartStateContext.Provider value={value}>
      {children}
    </CartStateContext.Provider>
  );
}

export function useCartState() {
  const ctx = useContext(CartStateContext);
  if (!ctx)
    throw new Error("useCartState must be used within CartStateProvider");
  return ctx;
}
