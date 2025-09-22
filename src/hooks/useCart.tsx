"use client";
import { useEffect, useRef, useState } from "react";
import type { CartClientItem, ServerMovie } from "@/types";

export function useCart(initialItems: CartClientItem[] = []) {
  const [items, setItems] = useState<CartClientItem[]>(initialItems);
  const inflight = useRef(false);

  useEffect(() => {
    // Always apply server-provided initial items immediately for fast UX,
    // but always revalidate against the server to ensure we don't render
    // stale data (legacy cookie payloads or out-of-band changes).
    if (initialItems && initialItems.length > 0) setItems(initialItems);
    // fetch authoritative server state regardless of initialItems
    (async () => {
      try {
        await revalidate();
      } catch {}
    })();

    // If the client landed here immediately after server-side migration the
    // server will add `migrated=1` to the callback so we can revalidate
    // automatically and show the merged items without requiring a manual
    // page refresh.
    try {
      if (typeof window !== "undefined" && window.location?.search) {
        const params = new URLSearchParams(window.location.search);
        if (params.get("migrated") === "1") {
          // remove the param from the URL (shallow) and revalidate after a
          // short microtask to let the router settle.
          try {
            const url = new URL(window.location.href);
            params.delete("migrated");
            const newUrl =
              url.pathname + (params.toString() ? `?${params.toString()}` : "");
            window.history.replaceState({}, "", newUrl);
          } catch {}
          // allow the redirect to complete and then revalidate
          Promise.resolve().then(() => revalidate());
        }
      }
    } catch {}
    // listen for external revalidation requests (e.g. after sign-in)
    function onRevalidate(): void {
      void revalidate();
    }

    // When server-side migration runs on sign-in, it returns the canonical
    // cart DTO — listen for that event and adopt items immediately.
    function onMigrated(e: Event): void {
      const ce = e as CustomEvent<{ items?: CartClientItem[] }>; // typed payload
      const payload = ce?.detail;
      if (payload && Array.isArray(payload.items)) {
        setItems(payload.items || []);
        const total = payload.items.reduce(
          (s: number, it: CartClientItem) => s + (it.quantity || 0),
          0
        );
        if (typeof window !== "undefined" && window.dispatchEvent) {
          void Promise.resolve().then(() => {
            try {
              window.dispatchEvent(
                new CustomEvent("cart:updated", {
                  detail: { count: total },
                })
              );
            } catch {
              // swallow logging errors
            }
          });
        }
      }
    }
    try {
      if (typeof window !== "undefined" && window.addEventListener) {
        window.addEventListener(
          "cart:revalidate",
          onRevalidate as EventListener
        );
        window.addEventListener("cart:migrated", onMigrated as EventListener);
      }
    } catch {}

    return () => {
      try {
        if (typeof window !== "undefined" && window.removeEventListener) {
          window.removeEventListener(
            "cart:revalidate",
            onRevalidate as EventListener
          );
          window.removeEventListener(
            "cart:migrated",
            onMigrated as EventListener
          );
        }
      } catch {}
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function revalidate() {
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) return;
      const j = await res.json();
      setItems(j.items || []);
      try {
        type FetchedItem = { quantity?: number };
        const total = Array.isArray(j.items)
          ? j.items.reduce(
              (s: number, it: FetchedItem) => s + (it.quantity || 0),
              0
            )
          : 0;
        // Dispatch a cross-window event so global listeners (e.g. CartCountProvider)
        // can update without a direct import or prop drilling.
        if (typeof window !== "undefined" && window.dispatchEvent) {
          Promise.resolve().then(() => {
            try {
              window.dispatchEvent(
                new CustomEvent("cart:updated", { detail: { count: total } })
              );
            } catch {}
          });
        }
      } catch {}
    } catch {}
  }

  function optimisticUpdate(
    updater: (prev: CartClientItem[]) => CartClientItem[]
  ) {
    setItems((prev) => {
      const next = updater(prev.map((i) => ({ ...i })));
      // also notify global listeners of the new total immediately
      try {
        const total = next.reduce(
          (s: number, it: CartClientItem) => s + (it.quantity || 0),
          0
        );
        if (typeof window !== "undefined" && window.dispatchEvent) {
          // dispatch asynchronously to avoid setState during render of other components
          Promise.resolve().then(() => {
            try {
              window.dispatchEvent(
                new CustomEvent("cart:updated", { detail: { count: total } })
              );
            } catch {}
          });
        }
      } catch {}
      return next;
    });
  }

  async function mutateServer(body: unknown) {
    if (inflight.current) return false;
    inflight.current = true;
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      inflight.current = false;
      await revalidate();
    }
  }

  async function add(movieId: string, qty = 1) {
    optimisticUpdate((prev) => {
      const idx = prev.findIndex((p) => p.movie.id === movieId);
      if (idx >= 0) {
        prev[idx].quantity += qty;
      } else {
        const placeholder: ServerMovie = {
          id: movieId,
          title: "",
          price: "0",
          genres: null,
          releaseDate: null,
          runtime: null,
          rating: null,
        } as unknown as ServerMovie;
        prev.push({ movie: placeholder, quantity: qty });
      }
      return prev;
    });
    return await mutateServer({ action: "add", movieId, quantity: qty });
  }

  async function update(movieId: string, quantity: number) {
    optimisticUpdate((prev) => {
      const idx = prev.findIndex((p) => p.movie.id === movieId);
      if (idx >= 0) {
        prev[idx].quantity = quantity;
        if (prev[idx].quantity <= 0) prev.splice(idx, 1);
      }
      return prev;
    });
    return await mutateServer({ action: "update", movieId, quantity });
  }

  async function remove(movieId: string) {
    optimisticUpdate((prev) => prev.filter((p) => p.movie.id !== movieId));
    return await mutateServer({ action: "remove", movieId });
  }

  return { items, add, update, remove, revalidate };
}
