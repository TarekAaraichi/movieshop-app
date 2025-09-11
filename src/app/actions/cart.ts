"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

type CartItem = { movieId: string; quantity: number };

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

  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart")?.value || "[]";
  const cart = parseCart(cartCookie);

  const idx = cart.findIndex((c) => c.movieId === movieId);
  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ movieId, quantity: 1 });

  cookieStore.set("cart", JSON.stringify(cart), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  }); // 1 week

  revalidatePath("/cart");
}

export async function updateCart(formData: FormData) {
  const movieId = formData.get("movieId") as string | null;
  const action = formData.get("action") as string | null; // 'inc'|'dec'|'remove'
  if (!movieId || !action) return;

  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart")?.value || "[]";
  const cart = parseCart(cartCookie);

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

  if (cart.length === 0) {
    cookieStore.delete("cart");
  } else {
    cookieStore.set("cart", JSON.stringify(cart), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }); // 1 week
  }

  revalidatePath("/cart");
}
