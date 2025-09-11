"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

type CartItem = { movieId: string; quantity: number };

interface CookieStore {
  get?: (name: string) => { value?: string } | undefined;
  set?: (name: string, value: string, opts?: { path?: string }) => void;
}

export async function addToCart(formData: FormData) {
  const movieId = formData.get("movieId") as string | null;
  if (!movieId) return;

  // cookies() can be synchronous or return a Promise based on environment; support both
  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs = cookieStore as unknown as CookieStore;
  const cartCookie =
    typeof cs.get === "function" ? cs.get("cart")?.value || "[]" : "[]";
  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(cartCookie);
  } catch {
    cart = [];
  }

  const idx = cart.findIndex((c) => c.movieId === movieId);
  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ movieId, quantity: 1 });

  if (typeof cs.set === "function")
    cs.set("cart", JSON.stringify(cart), { path: "/" });
  revalidatePath("/cart");
}

export async function updateCart(formData: FormData) {
  const movieId = formData.get("movieId") as string | null;
  const action = formData.get("action") as string | null; // 'inc'|'dec'|'remove'
  if (!movieId || !action) return;

  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs2 = cookieStore as unknown as CookieStore;
  const cartCookie =
    typeof cs2.get === "function" ? cs2.get("cart")?.value || "[]" : "[]";
  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(cartCookie);
  } catch {
    cart = [];
  }

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

  if (typeof cs2.set === "function")
    cs2.set("cart", JSON.stringify(cart), { path: "/" });
  revalidatePath("/cart");
}
