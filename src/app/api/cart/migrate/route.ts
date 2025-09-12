import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type CartItem = { movieId: string; quantity: number };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items } = body as { userId?: string; items?: CartItem[] };
    if (!userId || !Array.isArray(items)) {
      return NextResponse.json({ ok: false, message: "Missing userId or items" }, { status: 400 });
    }

    // find or create cart for user
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // replace items: simple approach - delete existing items and insert new ones
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    const createOps = items.map((i) =>
      prisma.cartItem.create({ data: { cartId: cart!.id, movieId: i.movieId, quantity: i.quantity } })
    );
    await Promise.all(createOps);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, message: `Error: ${String(err)}` }, { status: 500 });
  }
}
