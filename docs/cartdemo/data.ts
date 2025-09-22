import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { cache } from "react";
import { prismaSelect } from "./constants";
import { Prisma } from "@/generated/prisma/client";

export type CartPrismaPayload = Prisma.CartGetPayload<typeof prismaSelect>;

export function toCartDto(prismaCart: CartPrismaPayload) {
  return {
    ...prismaCart,
    items: prismaCart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: item.product.price.amount,
      },
    })),

    get totalPrice(): number {
      return this.items.reduce(
        (acc, item) => acc + item.quantity * item.product.price,
        0
      );
    },

    get itemCount(): number {
      return this.items.reduce((acc, item) => acc + item.quantity, 0);
    },
  };
}

export const getCartCookie = cache(async () => {
  const cookieStore = await cookies();
  return cookieStore.get("cart")?.value;
});

export const getCart = cache(async (cartId?: string | null) => {
  if (!cartId) return null;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    ...prismaSelect,
  });

  if (!cart) return null;

  return toCartDto(cart);
});