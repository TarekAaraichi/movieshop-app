/**
 * Order service (server)
 * Server-side helpers for creating orders, computing totals, and storing order items.
 */

import { prisma } from "@/lib";

type CartItemInput = { movieId: string; quantity: number };

type MovieWithPrice = {
  id: string;
  title: string;
  stock: number;
  // Prisma Decimal or number or string
  price:
    | number
    | string
    | { toNumber: () => number }
    | { toString: () => string }
    | null;
};

function isDecimalLike(v: unknown): v is { toNumber: () => number } {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as { toNumber?: unknown };
  return typeof obj.toNumber === "function";
}

function isToStringLike(v: unknown): v is { toString: () => string } {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as { toString?: unknown };
  return typeof obj.toString === "function";
}

function priceToNumber(price: MovieWithPrice["price"]): number {
  if (price == null) return 0;
  if (typeof price === "number") return price;
  if (isDecimalLike(price)) {
    try {
      return price.toNumber();
    } catch {
      // ignore and fallback to string
    }
  }
  const s = String(price);
  const n = Number(s);
  if (Number.isFinite(n)) return n;
  throw new Error("Invalid price value");
}

function priceToString(price: MovieWithPrice["price"]): string {
  if (price == null) return "0.00";
  if (typeof price === "string") return price;
  if (typeof price === "number") return price.toFixed(2);
  if (isToStringLike(price)) return price.toString();
  return String(price);
}

/**
 * Create an order from a user's cart items.
 * - Validates movie existence and available stock
 * - Computes total amount using current movie prices
 * - Creates Order and OrderItem rows in a single transaction
 * - Decrements stock on movies and clears the cart items
 */
export async function createOrderFromCart(
  userId: string,
  items: CartItemInput[],
  addressId?: string
) {
  if (!items || items.length === 0) {
    throw new Error("No items to create order from");
  }

  return await prisma.$transaction(async (tx) => {
    // Load movies to get current price and stock
    const movieIds = items.map((i) => i.movieId);
    const movies = await tx.movie.findMany({ where: { id: { in: movieIds } } });
    const movieMap = new Map(movies.map((m) => [m.id, m]));

    // Validate and compute totals
    // use string arithmetic for Prisma Decimal fields: accumulate as number and convert to string
    let totalNumber = 0;
    for (const it of items) {
      const movie = movieMap.get(it.movieId);
      if (!movie) throw new Error(`Movie ${it.movieId} not found`);
      if (movie.stock < it.quantity)
        throw new Error(`Not enough stock for ${movie.title}`);
      // movie.price is a Prisma Decimal-like object; convert safely to number
      const priceNum = priceToNumber(
        (movie as unknown as MovieWithPrice).price
      );
      totalNumber += priceNum * it.quantity;
    }

    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: totalNumber.toFixed(2),
        addressId: addressId || null,
      },
    });

    // Create order items and decrement stock
    for (const it of items) {
      const movie = movieMap.get(it.movieId)!;
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          movieId: movie.id,
          quantity: it.quantity,
          priceAtPurchase: priceToString(
            (movie as unknown as MovieWithPrice).price
          ),
        },
      });

      // decrement stock
      await tx.movie.update({
        where: { id: movie.id },
        data: { stock: movie.stock - it.quantity },
      });
    }

    // Clear cart items for this user (if a cart exists)
    const cart = await tx.cart.findUnique({ where: { userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return order;
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { movie: true } }, address: true },
  });
}
