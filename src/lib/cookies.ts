/**
 * Cookie helpers
 * Utilities for reading/writing and serializing the cart cookie and other app cookies.
 */

export type CartItem = { movieId: string; quantity: number };

/**
 * Parse a cookie store (unknown runtime shape) to extract the `cart` cookie value.
 * Returns an array of CartItem with safe parsing and fallbacks.
 */
export function parseCartFromStore(cookieStore: unknown): CartItem[] {
  function hasGetMethod(
    obj: unknown
  ): obj is { get: (name: string) => { value?: string } | undefined } {
    if (typeof obj !== "object" || obj === null) return false;
    const possible = obj as { get?: unknown };
    return typeof possible.get === "function";
  }

  const cookieJson = hasGetMethod(cookieStore)
    ? cookieStore.get("cart")?.value || "[]"
    : "[]";
  try {
    return JSON.parse(cookieJson) as CartItem[];
  } catch {
    return [];
  }
}

/**
 * Safely produce a cookie string for the cart array.
 */
export function serializeCart(cart: CartItem[]) {
  return JSON.stringify(cart ?? []);
}

// Named exports above are sufficient
