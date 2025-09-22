"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CART_COOKIE_NAME, COOKIE_OPTIONS, prismaSelect } from "./constants";
import { getCart, toCartDto } from "./data";

export async function addToCart(productId: string) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;

  let cart;
  try {
    cart = await prisma.cart.upsert({
      where: { id: cartId || "" },

      create: {
        items: {
          create: {
            product: { connect: { id: productId } },
            quantity: 1,
          },
        },
      },

      update: {
        items: {
          upsert: {
            where: { cartId_productId: { cartId: cartId ?? "", productId } },
            create: { product: { connect: { id: productId } }, quantity: 1 },
            update: { quantity: { increment: 1 } },
          },
        },
      },

      ...prismaSelect,
    });
  } catch {
    const cart = await getCart(cartId);
    revalidatePath("/", "layout");

    if (cart) return cart;

    cookieStore.delete(CART_COOKIE_NAME);
    return null;
  }

  if (!cart) return null;

  cookieStore.set(CART_COOKIE_NAME, cart.id, COOKIE_OPTIONS);
  revalidatePath("/", "layout");

  return toCartDto(cart);
}

export async function removeFromCart(productId: string) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) return null;

  const cart = await prisma.cart.update({
    where: { id: cartId },
    data: {
      items: {
        deleteMany: {
          productId,
        },
      },
    },
    ...prismaSelect,
  });

  if (cart.items.length === 0) {
    await prisma.cart.delete({ where: { id: cartId } });
    cookieStore.delete(CART_COOKIE_NAME);
    revalidatePath("/", "layout");
    return null;
  }

  cookieStore.set(CART_COOKIE_NAME, cart.id, COOKIE_OPTIONS);
  revalidatePath("/", "layout");

  return toCartDto(cart);
}

export async function updateCartQuantity(productId: string, quantity: number) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;

  let cart;
  try {
    cart = await prisma.cart.upsert({
      where: { id: cartId || "" },

      create: {
        items: {
          create: {
            product: { connect: { id: productId } },
            quantity,
          },
        },
      },

      update: {
        items: {
          upsert: {
            where: { cartId_productId: { cartId: cartId ?? "", productId } },
            create: { product: { connect: { id: productId } }, quantity },
            update: { quantity },
          },
        },
      },

      ...prismaSelect,
    });
  } catch {
    const cart = await getCart(cartId);
    revalidatePath("/", "layout");

    if (cart) return cart;

    cookieStore.delete(CART_COOKIE_NAME);
    return null;
  }

  if (!cart) return null;

  cookieStore.set(CART_COOKIE_NAME, cart.id, COOKIE_OPTIONS);
  revalidatePath("/", "layout");

  return toCartDto(cart);
}