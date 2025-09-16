"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/getServerSession";
import { findOrCreateUser } from "@/app/actions/orderHelpers";

const checkoutSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  line1: z.string().min(2),
  line2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  paymentToken: z.string().optional(),
});

type CartItem = { movieId: string; quantity: number };

function parseCartCookie(cookieStore: unknown) {
  function hasGetMethod(
    obj: unknown
  ): obj is { get: (name: string) => { value?: string } | undefined } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "get" in obj &&
      typeof (obj as unknown as Record<string, (name: string) => unknown>)
        .get === "function"
    );
  }

  const cookie = hasGetMethod(cookieStore)
    ? cookieStore.get("cart")?.value || "[]"
    : "[]";
  try {
    return JSON.parse(cookie) as CartItem[];
  } catch {
    return [];
  }
}

export async function createOrder(formData: FormData): Promise<void> {
  /*
    Server action auth scaffold (commented out):
    Server actions must validate the session as they can be invoked directly.
    Example:
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      // redirect or throw to surface authentication requirement
      redirect(`/sign-in?callbackUrl=${encodeURIComponent('/checkout')}`);
    }
  */
  const raw = Object.fromEntries(formData.entries());
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const formatted: Record<string, string> = {};
    const flat = parsed.error.flatten();
    for (const [k, v] of Object.entries(flat.fieldErrors)) {
      formatted[k] = Array.isArray(v) ? v[0] ?? "Invalid" : "Invalid";
    }
    const qs = encodeURIComponent(
      JSON.stringify({ _type: "validation", fields: formatted })
    );
    redirect(`/checkout?errors=${qs}`);
    return;
  }

  const maybeCookieStore = cookies();
  const cookieStore =
    maybeCookieStore instanceof Promise
      ? await maybeCookieStore
      : maybeCookieStore;
  const items = parseCartCookie(cookieStore);
  if (items.length === 0) {
    const qs = encodeURIComponent(
      JSON.stringify({ _type: "business", message: "Cart is empty" })
    );
    redirect(`/checkout?errors=${qs}`);
    return;
  }

  // Determine user to attach to order: prefer authenticated session, otherwise create/ reuse guest user.
  const session = await getServerSession();
  let userId: string;
  if (session?.user?.id) {
    userId = session.user.id;
  } else {
    // Guest checkout: create or reuse a user by email
    const guest = await findOrCreateUser(
      prisma,
      parsed.data.email,
      parsed.data.fullName
    );
    userId = guest.id;
  }

  // Validate stock and compute total
  const movieIds = items.map((i) => i.movieId);
  const movies = await prisma.movie.findMany({
    where: { id: { in: movieIds } },
  });
  const moviesById = new Map(movies.map((m) => [m.id, m]));

  let totalCents = 0;
  const orderItems = [] as {
    movieId: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  for (const it of items) {
    const movie = moviesById.get(it.movieId);
    if (!movie) {
      const qs = encodeURIComponent(
        JSON.stringify({
          _type: "business",
          message: `Movie ${it.movieId} not found`,
        })
      );
      redirect(`/checkout?errors=${qs}`);
      return;
    }
    if (movie.stock < it.quantity) {
      const qs = encodeURIComponent(
        JSON.stringify({
          _type: "business",
          message: `Not enough stock for ${movie.title || movie.id}`,
        })
      );
      redirect(`/checkout?errors=${qs}`);
      return;
    }
    const priceNum = Number(movie.price.toString());
    const cents = Math.round(priceNum * 100);
    totalCents += cents * it.quantity;
    orderItems.push({
      movieId: movie.id,
      quantity: it.quantity,
      priceAtPurchase: cents,
    });
  }

  // Persist order in transaction and clear cookie
  const result = await prisma.$transaction(async (tx) => {
    // Create address attached to the authenticated user
    const address = await tx.address.create({
      data: {
        userId,
        line1: parsed.data.line1,
        line2: parsed.data.line2 ?? null,
        city: parsed.data.city,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
      },
    });
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: `${(totalCents / 100).toFixed(2)}`,
        addressId: address.id,
        items: {
          create: orderItems.map((oi) => ({
            movieId: oi.movieId,
            quantity: oi.quantity,
            priceAtPurchase: `${(oi.priceAtPurchase / 100).toFixed(2)}`,
          })),
        },
      },
      include: { items: true },
    });

    for (const it of items) {
      await tx.movie.update({
        where: { id: it.movieId },
        data: { stock: { decrement: it.quantity } },
      });
    }

    return order;
  });

  // Clear cookie cart
  try {
    type CookieSetObj = (opts: {
      name: string;
      value: string;
      path?: string;
      maxAge?: number;
    }) => void;
    type CookieSetArgs = (
      name: string,
      value: string,
      opts?: { path?: string; maxAge?: number }
    ) => void;
    const cookieObj = cookieStore as unknown as {
      set?: CookieSetObj | CookieSetArgs;
    };
    if (cookieObj && typeof cookieObj.set === "function") {
      try {
        (cookieObj.set as CookieSetObj)({
          name: "cart",
          value: "",
          path: "/",
          maxAge: 0,
        });
      } catch {
        (cookieObj.set as CookieSetArgs)("cart", "", { path: "/", maxAge: 0 });
      }
    }
  } catch {}

  // Redirect to order confirmation page
  redirect(`/orders/${result.id}`);
  return;
}
