"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

type CartItem = { movieId: string; quantity: number };

interface CookieStore {
  get?: (name: string) => { value?: string } | undefined;
  set?: {
    (opts: { name: string; value: string; path?: string }): void;
    (name: string, value: string, opts?: { path?: string }): void;
  };
}

function parseCart(cookieValue?: string) {
  try {
    return JSON.parse(cookieValue || "[]") as CartItem[];
  } catch {
    return [];
  }
}

export async function addToCart(formData: FormData) {
  const movieId = formData.get("movieId") as string | null;
  if (!movieId) return;

  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs = cookieStore as unknown as CookieStore;
  const cartCookie =
    typeof cs.get === "function" ? cs.get("cart")?.value || "[]" : "[]";
  const cart = parseCart(cartCookie);

  const idx = cart.findIndex((c) => c.movieId === movieId);
  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ movieId, quantity: 1 });

  if (typeof cs.set === "function") {
    try {
      (cs.set as any)({ name: "cart", value: JSON.stringify(cart), path: "/" });
    } catch {
      (cs.set as any)("cart", JSON.stringify(cart), { path: "/" });
    }
  }

  revalidatePath("/cart");
}

export async function updateCart(formData: FormData) {
  const movieId = formData.get("movieId") as string | null;
  const action = formData.get("action") as string | null; // 'inc'|'dec'|'remove'
  if (!movieId || !action) return;

  const maybeCookies2 = cookies();
  const cookieStore2 =
    typeof (maybeCookies2 as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies2
      : maybeCookies2;
  const cs2 = cookieStore2 as unknown as CookieStore;
  const cartCookie2 =
    typeof cs2.get === "function" ? cs2.get("cart")?.value || "[]" : "[]";
  const cart = parseCart(cartCookie2);

  const idx = cart.findIndex((c) => c.movieId === movieId);
  if (action === "inc") {
    if (idx >= 0) cart[idx].quantity += 1;
    else cart.push({ movieId, quantity: 1 });
  } else if (action === "dec") {
    if (idx >= 0) {
      cart[idx].quantity -= 1;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    }
  } else if (action === "remove") {
    if (idx >= 0) cart.splice(idx, 1);
  }

  if (typeof cs2.set === "function") {
    try {
      (cs2.set as any)({
        name: "cart",
        value: JSON.stringify(cart),
        path: "/",
      });
    } catch {
      (cs2.set as any)("cart", JSON.stringify(cart), { path: "/" });
    }
  }

  revalidatePath("/cart");
}
