"use client";
import React, { useMemo, useEffect, useState } from "react";
import type { CartClientItem, ServerMovie } from "@/types";

interface Props {
  items: CartClientItem[];
}

export default function OrderSummaryClient({ items }: Props) {
  // Local copy so we can update optimistically via events without waiting for a rerender chain
  const [currentItems, setCurrentItems] = useState(items);

  // Sync external prop updates (SSR refresh, navigation) into local state
  useEffect(() => {
    setCurrentItems(items);
  }, [items]);

  // Listen for global cart mutation events dispatched by CartClient
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as unknown;
      // We dispatch the raw array from CartClient: detail === CartClientItem[]
      if (Array.isArray(detail)) {
        setCurrentItems(detail as CartClientItem[]);
        return;
      }
      // Fallback if future code wraps it: { items: CartClientItem[] }
      // @ts-expect-error runtime guard
      if (detail && Array.isArray(detail.items)) {
        // @ts-expect-error runtime guard ensures correctness
        setCurrentItems(detail.items as CartClientItem[]);
      }
    };
    window.addEventListener("cart:items-changed", handler as EventListener);
    return () =>
      window.removeEventListener(
        "cart:items-changed",
        handler as EventListener
      );
  }, []);

  const {
    subtotal,
    tax,
    shipping,
    total,
    freeShippingThreshold,
    hasFreeShipping,
    remainingForFreeShipping,
    progressPercent,
  } = useMemo(() => {
    const subtotalVal = currentItems.reduce(
      (sum, it) =>
        sum +
        (Number((it.movie as ServerMovie)?.price ?? "0") || 0) * it.quantity,
      0
    );
    const tax = subtotalVal * 0.08;
    const FIXED_SHIPPING_FEE = 49; // base shipping
    const FREE_SHIPPING_THRESHOLD = 500; // threshold for free shipping (SEK)
    const hasFreeShipping = subtotalVal >= FREE_SHIPPING_THRESHOLD;
    const shipping =
      subtotalVal > 0 ? (hasFreeShipping ? 0 : FIXED_SHIPPING_FEE) : 0;
    const remainingForFreeShipping = hasFreeShipping
      ? 0
      : Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalVal);
    const progressPercent = Math.min(
      100,
      (subtotalVal / FREE_SHIPPING_THRESHOLD) * 100
    );
    return {
      subtotal: subtotalVal,
      tax,
      shipping,
      total: subtotalVal + tax + shipping,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      hasFreeShipping,
      remainingForFreeShipping,
      progressPercent,
    };
  }, [currentItems]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
    }).format(n);

  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <div>
        <h2 className="text-sm font-medium text-slate-600">Order summary</h2>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {fmt(total)}
        </p>
      </div>
      <div className="text-sm text-slate-500 space-y-2">
        {hasFreeShipping ? (
          <div className="text-green-600 font-medium">
            🎉 You unlocked FREE shipping!
          </div>
        ) : subtotal > 0 ? (
          <div className="text-slate-600">
            Add{" "}
            <span className="font-semibold">
              {fmt(remainingForFreeShipping)}
            </span>{" "}
            more for <span className="font-semibold">FREE shipping</span>
          </div>
        ) : (
          <div>Spend {fmt(freeShippingThreshold)} to unlock free shipping.</div>
        )}
        <div
          className="h-2 w-full rounded bg-slate-200 overflow-hidden"
          aria-label="Progress toward free shipping"
        >
          {(() => {
            const pct = Math.round(progressPercent);
            const steps = [
              0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80,
              85, 90, 95, 100,
            ];
            const closest = steps.reduce(
              (a, b) => (Math.abs(b - pct) < Math.abs(a - pct) ? b : a),
              0
            );
            const widthClass = {
              0: "w-0",
              5: "w-[5%]",
              10: "w-1/10",
              15: "w-[15%]",
              20: "w-1/5",
              25: "w-1/4",
              30: "w-[30%]",
              35: "w-[35%]",
              40: "w-2/5",
              45: "w-[45%]",
              50: "w-1/2",
              55: "w-[55%]",
              60: "w-3/5",
              65: "w-[65%]",
              70: "w-7/10",
              75: "w-3/4",
              80: "w-4/5",
              85: "w-[85%]",
              90: "w-9/10",
              95: "w-[95%]",
              100: "w-full",
            } as Record<number, string>;
            return (
              <div
                className={`h-full ${
                  widthClass[closest] || "w-0"
                } transition-all duration-300 ${
                  hasFreeShipping ? "bg-green-500" : "bg-indigo-500"
                }`}
              />
            );
          })()}
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100 space-y-2 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated tax (8%)</span>
          <span>{fmt(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{fmt(shipping)}</span>
        </div>
      </div>
    </div>
  );
}
