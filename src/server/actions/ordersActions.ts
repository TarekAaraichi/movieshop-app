/**
 * Server action helpers: ordersActions
 * Helpers to query orders, format details, and support order-related pages.
 */

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
const prisma = (await import("@/lib/prisma")).default;
import { getServerSession } from "@/lib/getServerSession";
import { findOrCreateUser } from "./orderHelpersActions";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/requireAdmin";

const checkoutSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  // address fields are optional here because callers may submit an existing address id
  line1: z.string().min(2).optional(),
  line2: z.string().optional(),
  city: z.string().min(1).optional(),
  postalCode: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9 \-]+$/, "Postal code contains invalid characters")
    .optional(),
  country: z.string().min(1).optional(),
  selectedAddressId: z.string().optional(),
  saveAddress: z.string().optional(),
  paymentToken: z
    .string()
    .regex(/^[0-9]{13,19}$/, "Payment token must be 13–19 digits")
    .optional(),
});

type CartItem = { movieId: string; quantity: number };

function parseCartCookie(cookieStore: unknown) {
  function hasGetMethod(
    obj: unknown,
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
  const raw = Object.fromEntries(formData.entries());
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const formatted: Record<string, string> = {};
    const flat = parsed.error.flatten();
    for (const [k, v] of Object.entries(flat.fieldErrors)) {
      formatted[k] = Array.isArray(v) ? (v[0] ?? "Invalid") : "Invalid";
    }
    const qs = encodeURIComponent(
      JSON.stringify({ _type: "validation", fields: formatted }),
    );
    redirect(`/checkout?errors=${qs}`);
    return;
  }

  const maybeCookieStore = cookies();
  const cookieStore =
    maybeCookieStore instanceof Promise
      ? await maybeCookieStore
      : maybeCookieStore;
  let items: CartItem[] = [];
  let sourceCartId: string | undefined = undefined;
  const serverSession = await getServerSession();
  const s = serverSession as unknown as { user?: { id?: string } } | null;
  if (s?.user?.id) {
    type CartModel = { findUnique: (args: unknown) => Promise<unknown> };
    const candidate = prisma as unknown as { cart?: CartModel };
    const hasCartModel = typeof candidate?.cart?.findUnique === "function";
    if (hasCartModel) {
      const userCart = await candidate.cart!.findUnique({
        where: { userId: s.user.id },
        include: { items: true },
      } as unknown);
      if (
        userCart &&
        Array.isArray((userCart as unknown as { items?: unknown[] }).items)
      ) {
        items = (
          userCart as unknown as {
            items: { movieId: string; quantity: number }[];
          }
        ).items.map((it) => ({ movieId: it.movieId, quantity: it.quantity }));
      }
    }
  }
  if (items.length === 0) {
    try {
      const cookieObj = cookieStore as unknown as {
        get?: (name: string) => { value?: string } | undefined;
      };
      const cookie = cookieObj.get?.("cart")?.value;
      if (cookie) {
        type CartModel = { findUnique: (args: unknown) => Promise<unknown> };
        const candidate = prisma as unknown as { cart?: CartModel };
        const hasCartModel = typeof candidate?.cart?.findUnique === "function";
        if (hasCartModel) {
          const cart = await candidate.cart!.findUnique({
            where: { id: cookie },
            include: { items: true },
          } as unknown);
          if (
            cart &&
            Array.isArray((cart as unknown as { items?: unknown[] }).items)
          ) {
            items = (
              cart as unknown as {
                items: { movieId: string; quantity: number }[];
              }
            ).items.map((it) => ({
              movieId: it.movieId,
              quantity: it.quantity,
            }));
            sourceCartId = cookie;
          }
        } else {
          try {
            const parsed = JSON.parse(cookie) as unknown;
            if (Array.isArray(parsed)) {
              items = parsed
                .filter((p): p is { movieId: string; quantity: number } => {
                  const r = p as unknown as Record<string, unknown>;
                  return !!(r && typeof r["movieId"] === "string");
                })
                .map((p) => {
                  const r = p as unknown as Record<string, unknown>;
                  return {
                    movieId: String(r["movieId"]),
                    quantity: Number(r["quantity"]) || 0,
                  };
                });
            }
          } catch {
            // ignore and leave items empty
          }
        }
      }
    } catch {
      items = parseCartCookie(cookieStore);
    }
  }
  if (items.length === 0) {
    const qs = encodeURIComponent(
      JSON.stringify({ _type: "business", message: "Cart is empty" }),
    );
    redirect(`/checkout?errors=${qs}`);
    return;
  }

  let userId: string;
  if (s?.user?.id) {
    userId = s.user.id as string;
  } else {
    console.debug(
      "orders.createOrder: calling findOrCreateUser",
      typeof findOrCreateUser,
    );
    const guest = await findOrCreateUser(
      parsed.data.email,
      parsed.data.fullName,
    );
    userId = guest.id as string;
  }

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
        }),
      );
      redirect(`/checkout?errors=${qs}`);
      return;
    }
    if (movie.stock < it.quantity) {
      const qs = encodeURIComponent(
        JSON.stringify({
          _type: "business",
          message: `Not enough stock for ${movie.title || movie.id}`,
        }),
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

  // Determine address to use: prefer an explicitly selected address id; otherwise
  // deduplicate by comparing normalized address fields and create if none found.
  const selectedAddressIdRaw = raw["selectedAddressId"] as string | undefined;
  const selectedAddressId =
    selectedAddressIdRaw && selectedAddressIdRaw !== "NEW"
      ? String(selectedAddressIdRaw)
      : undefined;
  // If a selectedAddressId was provided, verify it belongs to the user
  if (selectedAddressId) {
    try {
      const found = await prisma.address.findUnique({
        where: { id: selectedAddressId },
      });
      if (!found || found.userId !== userId) {
        const qs = encodeURIComponent(
          JSON.stringify({
            _type: "business",
            message: "Selected address is not valid",
          }),
        );
        redirect(`/checkout?errors=${qs}`);
        return;
      }
    } catch {
      const qs = encodeURIComponent(
        JSON.stringify({
          _type: "business",
          message: "Selected address is not valid",
        }),
      );
      redirect(`/checkout?errors=${qs}`);
      return;
    }
  }

  // If we're not using an existing address id, ensure address fields are present
  if (!selectedAddressId) {
    const missing = [] as string[];
    if (!parsed.data.line1) missing.push("line1");
    if (!parsed.data.city) missing.push("city");
    if (!parsed.data.postalCode) missing.push("postalCode");
    if (!parsed.data.country) missing.push("country");
    if (missing.length > 0) {
      const formatted: Record<string, string> = {};
      for (const m of missing) formatted[m] = "Invalid";
      const qs = encodeURIComponent(
        JSON.stringify({ _type: "validation", fields: formatted }),
      );
      redirect(`/checkout?errors=${qs}`);
      return;
    }
  }

  // Try to find an existing address that matches the submitted fields (case-insensitive)
  let existingAddressId: string | undefined;
  if (!selectedAddressId) {
    try {
      const maybe = await prisma.address.findFirst({
        where: {
          userId,
          line1: {
            equals: (parsed.data.line1 ?? "").trim(),
            mode: "insensitive",
          },
          city: {
            equals: (parsed.data.city ?? "").trim(),
            mode: "insensitive",
          },
          postalCode: {
            equals: (parsed.data.postalCode ?? "").trim(),
            mode: "insensitive",
          },
          country: {
            equals: (parsed.data.country ?? "").trim(),
            mode: "insensitive",
          },
        },
      });
      if (maybe) existingAddressId = maybe.id;
    } catch {
      // ignore and fallthrough to creating a new address
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const address = selectedAddressId
      ? await tx.address.findUnique({ where: { id: selectedAddressId } })
      : existingAddressId
        ? await tx.address.findUnique({ where: { id: existingAddressId } })
        : await tx.address.create({
            data: {
              userId,
              line1: parsed.data.line1 as string,
              line2: parsed.data.line2 ?? null,
              city: parsed.data.city as string,
              postalCode: parsed.data.postalCode as string,
              country: parsed.data.country as string,
            },
          });

    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: `${(totalCents / 100).toFixed(2)}`,
        addressId: address?.id ?? null,
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

  // If the order was created from a cookie-referenced DB cart, delete that cart
  // and its items (but only if it is not the same as the user's cart).
  try {
    if (sourceCartId) {
      const source = await prisma.cart.findUnique({
        where: { id: sourceCartId },
      });
      if (source && source.userId !== userId) {
        try {
          await prisma.$transaction(async (tx) => {
            await tx.cartItem.deleteMany({ where: { cartId: sourceCartId } });
            await tx.cart.delete({ where: { id: sourceCartId } });
          });
          console.log(
            "[orders.createOrder] removed source anonymous cart:",
            sourceCartId,
          );
        } catch (e) {
          console.error(
            "[orders.createOrder] failed to remove source cart:",
            e,
          );
        }
      }
    }
  } catch (e) {
    console.error("[orders.createOrder] error while cleaning source cart:", e);
  }

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
      opts?: { path?: string; maxAge?: number },
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

  // Defensive cleanup: ensure the user's cart has been cleared server-side.
  try {
    if (userId) {
      // Remove items from all carts owned by this user (defensive cleanup).
      try {
        const userCarts = await prisma.cart.findMany({
          where: { userId },
          select: { id: true },
        });
        const cartIds = userCarts.map((c) => c.id);
        if (cartIds.length > 0) {
          const deleted = await prisma.cartItem.deleteMany({
            where: { cartId: { in: cartIds } },
          });
          console.log(
            "[orders.createOrder] cleaned remaining items from user carts:",
            userId,
            cartIds,
            "deletedCount:",
            deleted.count ?? deleted,
          );
        }
      } catch (e) {
        console.error(
          "[orders.createOrder] failed to clean remaining user cart items:",
          e,
        );
      }
    }
  } catch (e) {
    console.error("[orders.createOrder] error during final cart cleanup:", e);
  }

  redirect(`/orders/${result.id}`);
  return;
}

export async function cancelOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("orderId") as string;
  if (!id) throw new Error("Missing order ID");

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) {
    redirect(`/admin?error=notfound`);
    return;
  }

  if (order.status === "CANCELLED") {
    redirect(
      `/admin?error=already_cancelled&title=${encodeURIComponent(order.id)}`,
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status: "CANCELLED" } });
    for (const item of order.items || []) {
      await tx.movie.update({
        where: { id: item.movieId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });

  try {
    revalidatePath("/admin");
  } catch {}

  redirect(`/admin?updated=1&title=${encodeURIComponent(order.id)}`);
}
