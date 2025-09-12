import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const checkoutSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  line1: z.string().min(2),
  line2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  paymentToken: z.string().optional(), // simulated
});

type CartItem = { movieId: string; quantity: number };

// We removed Better Auth integration for now. Checkout will use cookie cart
// (guest checkout). If you later re-add auth, you can restore session lookup.

function parseCartCookie(cookieStore: unknown) {
  // Mirror the project's readCart guard: support objects with .get(name)
  function hasGetMethod(
    obj: unknown
  ): obj is { get: (name: string) => { value?: string } | undefined } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'get' in obj &&
      typeof (obj as unknown as Record<string, (name: string) => unknown>).get === 'function'
    );
  }

  const cookie = hasGetMethod(cookieStore) ? cookieStore.get('cart')?.value || '[]' : '[]';
  try {
    return JSON.parse(cookie) as CartItem[];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid_input', issues: parsed.error.format() }, { status: 400 });
    }

    // Load cart: prefer DB cart if a userId cookie exists, otherwise read cookie cart (guest)
    const maybeCookieStore = cookies();
    const cookieStore = (maybeCookieStore instanceof Promise) ? await maybeCookieStore : maybeCookieStore;

    function hasGetMethod(
      obj: unknown
    ): obj is { get: (name: string) => { value?: string } | undefined } {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        'get' in obj &&
        typeof (obj as unknown as Record<string, (name: string) => unknown>).get === 'function'
      );
    }

    const userIdFromCookie = hasGetMethod(cookieStore) ? cookieStore.get('userId')?.value ?? null : null;
    let items: CartItem[] = [];
    if (userIdFromCookie) {
      const dbCart = await prisma.cart.findUnique({ where: { userId: userIdFromCookie }, include: { items: true } });
      if (dbCart && dbCart.items.length > 0) {
        items = dbCart.items.map((i) => ({ movieId: i.movieId, quantity: i.quantity }));
      }
    }
    if (items.length === 0) {
      items = parseCartCookie(cookieStore);
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'empty_cart' }, { status: 400 });
    }

    // Validate stock and compute total
    const movieIds = items.map((i) => i.movieId);
    const movies = await prisma.movie.findMany({ where: { id: { in: movieIds } } });
    const moviesById = new Map(movies.map((m) => [m.id, m]));

    let totalCents = 0; // integer cents
    const orderItems = [] as { movieId: string; quantity: number; priceAtPurchase: bigint }[];
    for (const it of items) {
      const movie = moviesById.get(it.movieId);
      if (!movie) return NextResponse.json({ error: 'movie_not_found', movieId: it.movieId }, { status: 400 });
      if (movie.stock < it.quantity) return NextResponse.json({ error: 'out_of_stock', movieId: movie.id }, { status: 400 });
      // Prisma Decimal to string -> convert to cents using number rounding
      const priceNum = parseFloat(movie.price.toString());
      const cents = Math.round(priceNum * 100);
      totalCents += cents * it.quantity;
      orderItems.push({ movieId: movie.id, quantity: it.quantity, priceAtPurchase: BigInt(cents) });
    }

    // Persist order in transaction: create address (attach to user), create order and items, decrement stock, clear cart
      const result = await prisma.$transaction(async (tx) => {
        // If no userId cookie, create an anonymous User record to attach the order to
        let finalUserId = userIdFromCookie;
        if (!finalUserId) {
          const anon = await tx.user.create({
            data: {
              email: parsed.data.email,
              password: '', // no password for anonymous account
              name: parsed.data.fullName,
              isAnonymous: true,
            },
          });
          finalUserId = anon.id;
        }

        const address = await tx.address.create({
          data: {
            userId: finalUserId!,
            line1: parsed.data.line1,
            line2: parsed.data.line2 ?? null,
            city: parsed.data.city,
            postalCode: parsed.data.postalCode,
            country: parsed.data.country,
          },
        });

        const order = await tx.order.create({
          data: {
            userId: finalUserId!,
            totalAmount: `${(totalCents / 100).toFixed(2)}`,
            items: {
              create: orderItems.map((oi) => ({ movieId: oi.movieId, quantity: oi.quantity, priceAtPurchase: `${(Number(oi.priceAtPurchase) / 100).toFixed(2)}` })),
            },
            addressId: address.id,
          },
          include: { items: true },
        });

      // decrement stock
      for (const it of items) {
        await tx.movie.update({ where: { id: it.movieId }, data: { stock: { decrement: it.quantity } } });
      }

      // clear DB cart if present
      if (userIdFromCookie) {
        await tx.cartItem.deleteMany({ where: { cart: { userId: userIdFromCookie } } });
      }

      return order;
    });

    // Clear cookie cart by returning a response that clears it
    const res = NextResponse.json({ orderId: result.id });
    res.cookies.set('cart', '', { path: '/', maxAge: 0 });
    return res;
  } catch (err) {
    console.error('checkout error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
