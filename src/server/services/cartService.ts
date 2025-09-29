/**
 * Cart service (server)
 * Contains server-side logic for creating and updating canonical carts in the database.
 */

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const CART_COOKIE_NAME = "cart";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

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
        // fallback signature
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
  const cartId = await getCartIdFromCookie();
  if (cartId) {
    const existing = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });
    if (existing) return existing;
    // If cookie value exists but didn't match a cart, it may be a legacy
    // payload (an array of items serialized into the `cart` cookie). In that
    // case parse and migrate into a new DB cart so users don't unexpectedly
    // lose items when we switch to DB-backed carts.
    try {
      const maybe = JSON.parse(cartId);
      if (Array.isArray(maybe) && maybe.length > 0) {
        // create a new cart and populate items transactionally
        const newCart = await prisma.cart.create({ data: {} });
        await prisma.$transaction(async (tx) => {
          for (const it of maybe) {
            const movieId = it.movieId || it.id || it.movie?.id;
            const qty = Number(it.quantity || it.qty || 0) || 0;
            if (movieId && qty > 0) {
              await tx.cartItem.create({
                data: { cartId: newCart.id, movieId, quantity: qty },
              });
            }
          }
        });
        await setCartIdCookie(newCart.id);
        // reload with items included
        return await prisma.cart.findUnique({
          where: { id: newCart.id },
          include: { items: true },
        });
      }
    } catch {
      // not JSON / not legacy format — fallthrough to create new empty cart
    }
  }
  const newCart = await prisma.cart.create({ data: {} });
  await setCartIdCookie(newCart.id);
  return newCart;
}

export async function toDto(cart: {
  id: string;
  items?: { movieId: string; quantity: number }[];
}) {
  const movieIds = cart.items?.map((i) => i.movieId) ?? [];
  const movies = movieIds.length
    ? await prisma.movie.findMany({
        where: { id: { in: movieIds } },
        // Include genres so client cart can display them without extra fetches
        include: { genres: { include: { genre: true } } },
      })
    : [];
  const movieMap = new Map(movies.map((m) => [m.id, m]));
  return {
    id: cart.id,
    items: (cart.items || []).map((it) => ({
      quantity: it.quantity,
      movie: movieMap.get(it.movieId) || null,
    })),
  };
}

export async function addItemToCart(
  cartId: string,
  movieId: string,
  quantity = 1
) {
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_movieId: { cartId, movieId } },
  });
  if (existing) {
    await prisma.cartItem.update({
      where: { cartId_movieId: { cartId, movieId } },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({ data: { cartId, movieId, quantity } });
  }
}

export async function updateItemInCart(
  cartId: string,
  movieId: string,
  quantity: number
) {
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartId, movieId } });
  } else {
    await prisma.cartItem.upsert({
      where: { cartId_movieId: { cartId, movieId } },
      update: { quantity },
      create: { cartId, movieId, quantity },
    });
  }
}

export async function removeItemFromCart(cartId: string, movieId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId, movieId } });
}

export async function mergeLegacyIntoUser(
  userId: string,
  legacy: { movieId: string; quantity: number }[],
  opts?: { replaceExisting?: boolean }
) {
  if (!legacy || !legacy.length) return;
  try {
    console.log(
      "[cartService] mergeLegacyIntoUser userId:",
      userId,
      "items:",
      legacy.length,
      "opts:",
      opts ?? null
    );
  } catch {}
  // Find or create the user's cart
  let userCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!userCart) {
    const created = await prisma.cart.create({ data: { userId } });
    userCart = await prisma.cart.findUnique({
      where: { id: created.id },
      include: { items: true },
    });
  }

  // Merge items transactionally
  await prisma.$transaction(async (tx) => {
    if (opts?.replaceExisting) {
      // Remove any existing items on the user's cart and insert the legacy items
      await tx.cartItem.deleteMany({ where: { cartId: userCart!.id } });
      for (const it of legacy) {
        await tx.cartItem.create({
          data: {
            cartId: userCart!.id,
            movieId: it.movieId,
            quantity: it.quantity,
          },
        });
      }
    } else {
      for (const it of legacy) {
        const existing = await tx.cartItem.findUnique({
          where: {
            cartId_movieId: { cartId: userCart!.id, movieId: it.movieId },
          },
        });
        if (existing) {
          await tx.cartItem.update({
            where: {
              cartId_movieId: { cartId: userCart!.id, movieId: it.movieId },
            },
            data: { quantity: existing.quantity + it.quantity },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: userCart!.id,
              movieId: it.movieId,
              quantity: it.quantity,
            },
          });
        }
      }
    }
  });
  try {
    console.log(
      "[cartService] mergeLegacyIntoUser completed for userId:",
      userId
    );
  } catch {}
}

export async function mergeCartIntoUser(userId: string, sourceCartId: string) {
  if (!sourceCartId) return;
  try {
    console.log(
      "[cartService] mergeCartIntoUser userId:",
      userId,
      "sourceCartId:",
      sourceCartId
    );
  } catch {}
  // Load source cart and items
  const sourceCart = await prisma.cart.findUnique({
    where: { id: sourceCartId },
    include: { items: true },
  });
  if (!sourceCart || !sourceCart.items || sourceCart.items.length === 0) return;
  // If the source cart already belongs to the user, nothing to do
  if (sourceCart.userId === userId) return;

  // Find or create user's cart
  let userCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!userCart) {
    const created = await prisma.cart.create({ data: { userId } });
    userCart = await prisma.cart.findUnique({
      where: { id: created.id },
      include: { items: true },
    });
  }

  // Merge items transactionally: sum quantities, then remove source cart
  await prisma.$transaction(async (tx) => {
    for (const it of sourceCart.items!) {
      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_movieId: { cartId: userCart!.id, movieId: it.movieId },
        },
      });
      if (existing) {
        await tx.cartItem.update({
          where: {
            cartId_movieId: { cartId: userCart!.id, movieId: it.movieId },
          },
          data: { quantity: existing.quantity + it.quantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: userCart!.id,
            movieId: it.movieId,
            quantity: it.quantity,
          },
        });
      }
    }
    // Remove items from source cart and delete the cart row
    await tx.cartItem.deleteMany({ where: { cartId: sourceCartId } });
    await tx.cart.delete({ where: { id: sourceCartId } });
  });
  try {
    console.log(
      "[cartService] mergeCartIntoUser completed for userId:",
      userId,
      "sourceCartId:",
      sourceCartId
    );
  } catch {}
}
