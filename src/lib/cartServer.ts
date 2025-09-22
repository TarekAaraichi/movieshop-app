import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const CART_COOKIE_NAME = "cart";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: CART_COOKIE_MAX_AGE,
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

export async function getCartIdFromCookie() {
  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs = cookieStore as unknown as {
    get?: (n: string) => { value?: string };
  };
  return typeof cs.get === "function"
    ? cs.get(CART_COOKIE_NAME)?.value
    : undefined;
}

export async function setCartIdCookie(cartId: string) {
  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs = cookieStore as unknown as {
    set?: (opts: {
      name: string;
      value: string;
      path?: string;
      maxAge?: number;
    }) => void;
  };
  if (typeof cs.set === "function") {
    try {
      cs.set({
        name: CART_COOKIE_NAME,
        value: cartId,
        path: "/",
        maxAge: CART_COOKIE_MAX_AGE,
      });
    } catch {
      try {
        // Some runtimes use (name, value, opts)
        (
          cs.set as unknown as (
            name: string,
            value: string,
            opts?: { path?: string; maxAge?: number }
          ) => void
        )(CART_COOKIE_NAME, cartId, { path: "/", maxAge: CART_COOKIE_MAX_AGE });
      } catch {}
    }
  }
}

export async function getOrCreateCartForAnonymous() {
  // If a cookie cart id exists and matches a DB cart, return it. Otherwise create a new DB cart and return it.
  const cartId = await getCartIdFromCookie();
  if (cartId) {
    const existing = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });
    if (existing) return existing;
  }
  const newCart = await prisma.cart.create({ data: {} });
  await setCartIdCookie(newCart.id);
  return newCart;
}
