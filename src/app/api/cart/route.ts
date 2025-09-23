/**
 * API: /api/cart (ensured)
 * Handles cart mutations (add/update/remove) and returns the canonical cart DTO.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib";
import * as cartService from "@/server/services";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";

type CartItemRecord = { cartId: string; movieId: string; quantity: number };

type CartDto = {
  id: string;
  items: { quantity: number; movie: Record<string, unknown> | null }[];
};

async function toDto(cart: {
  id: string;
  items?: CartItemRecord[];
}): Promise<CartDto> {
  // cartService.toDto expects a shape compatible with the DB cart; cast via unknown to avoid `any` lint
  return await cartService.toDto(
    cart as unknown as Parameters<typeof cartService.toDto>[0]
  );
}

export async function GET() {
  // Prefer authenticated user's cart if present
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    try {
      // Lightweight debug logging for troubleshooting
      console.log("[api/cart] GET session:", {
        userId: session?.user?.id ?? null,
      });
    } catch {}
    if (session?.user?.id) {
      const userCart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: { items: true },
      });
      try {
        console.log(
          "[api/cart] GET using userCart for userId",
          session.user.id,
          "items:",
          userCart?.items?.length ?? 0
        );
      } catch {}
      if (userCart) return NextResponse.json(await toDto(userCart));
    }
  } catch {}

  // Try to use cookie cart id next
  const cartId = await cartService.getCartIdFromCookie();
  try {
    console.log("[api/cart] GET cookie cartId:", cartId ?? null);
  } catch {}
  const cart = cartId
    ? await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: true },
      })
    : await cartService.getOrCreateCartForAnonymous();
  try {
    const maybe = cart as unknown as
      | { items?: unknown; id?: string }
      | null
      | undefined;
    const itemCount = Array.isArray(maybe?.items) ? maybe!.items!.length : 0;
    console.log(
      "[api/cart] GET resolved cart id:",
      maybe?.id ?? null,
      "items:",
      itemCount
    );
  } catch {}
  if (!cart) return NextResponse.json({ items: [] });
  const dto = await toDto(cart);
  return NextResponse.json(dto);
}

export async function POST(req: Request) {
  // Accept body like { action: 'add'|'update'|'remove'|'clear', movieId, quantity }
  const body = await req.json().catch(() => ({}));
  const { action, movieId, quantity } = body as {
    action?: string;
    movieId?: string;
    quantity?: number;
  };
  if (!movieId && action !== "clear")
    return NextResponse.json(
      { ok: false, message: "missing_movieId" },
      { status: 400 }
    );
  // Prefer the authenticated user's cart when available so client-side
  // mutations (add/update/remove) affect the user's canonical cart.
  let cart = null as null | { id: string };
  let isUserCart = false;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    try {
      console.log(
        "[api/cart][POST] session userId:",
        session?.user?.id ?? null
      );
    } catch {}
    if (session?.user?.id) {
      // find or create a cart for this user
      let userCart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
      });
      if (!userCart) {
        userCart = await prisma.cart.create({
          data: { userId: session.user.id },
        });
      }
      cart = { id: userCart.id };
      isUserCart = true;
    }
  } catch {}

  // Fallback to anonymous/cart-id cookie when no session present
  if (!cart) {
    const anon = await cartService.getOrCreateCartForAnonymous();
    if (!anon) return NextResponse.json({ ok: false }, { status: 500 });
    cart = { id: anon.id };
    isUserCart = false;
  }

  try {
    const cookieVal = await cartService.getCartIdFromCookie();
    console.log(
      "[api/cart][POST] resolved cartId:",
      cart.id,
      "cookieCartId:",
      cookieVal ?? null
    );
  } catch {}

  if (action === "add") {
    // movieId is required for add/update/remove per earlier validation
    const mId = movieId as string;
    await cartService.addItemToCart(cart.id, mId, quantity || 1);
  } else if (action === "update") {
    if (typeof quantity !== "number")
      return NextResponse.json(
        { ok: false, message: "missing_quantity" },
        { status: 400 }
      );
    const mId = movieId as string;
    await cartService.updateItemInCart(cart.id, mId, quantity);
  } else if (action === "remove") {
    const mId = movieId as string;
    await cartService.removeItemFromCart(cart.id, mId);
  } else if (action === "clear") {
    try {
      // If user cart, clear all items for user's carts; otherwise delete anonymous cart
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.user?.id) {
        // remove items from all carts owned by this user
        const userCarts = await prisma.cart.findMany({
          where: { userId: session.user.id },
          select: { id: true },
        });
        const ids = userCarts.map((c) => c.id);
        if (ids.length > 0)
          await prisma.cartItem.deleteMany({ where: { cartId: { in: ids } } });
        // ensure cookie cleaned
        try {
          const cs = cookies();
          const cookieStore =
            typeof (cs as unknown as Promise<unknown>).then === "function"
              ? await cs
              : cs;
          const c = cookieStore as unknown as { delete?: (n: string) => void };
          if (typeof c.delete === "function") c.delete("cart");
        } catch {}
      } else {
        // anonymous cart
        try {
          const cid = await cartService.getCartIdFromCookie();
          if (cid) {
            try {
              await prisma.cartItem.deleteMany({ where: { cartId: cid } });
            } catch {}
            try {
              await prisma.cart.delete({ where: { id: cid } });
            } catch {}
          }
        } catch {}
        try {
          await cartService.setCartIdCookie("");
        } catch {}
      }
    } catch {}
  } else {
    return NextResponse.json(
      { ok: false, message: "unknown_action" },
      { status: 400 }
    );
  }

  // Return updated cart DTO. Ensure cookie is set only for anonymous carts.
  try {
    if (isUserCart) {
      // avoid leaking a user's cart id to anonymous sessions: delete cookie
      try {
        const cs = cookies();
        const cookieStore =
          typeof (cs as unknown as Promise<unknown>).then === "function"
            ? await cs
            : cs;
        const c = cookieStore as unknown as { delete?: (n: string) => void };
        if (typeof c.delete === "function") c.delete("cart");
      } catch {}
    } else {
      await cartService.setCartIdCookie(cart.id);
    }
  } catch {}
  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: true },
  });
  if (!updated) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json(await toDto(updated));
}
