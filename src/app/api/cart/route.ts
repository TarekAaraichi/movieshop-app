import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type CartItem = { movieId: string; quantity: number };

function readCart(cookieStore: unknown): CartItem[] {
  // `cookies()` may return a ReadonlyRequestCookies or a Promise in different runtimes.
  const c = cookieStore as unknown as Record<string, any>;
  const cartCookie =
    typeof c?.get === "function" ? c.get("cart")?.value || "[]" : "[]";
  try {
    return JSON.parse(cartCookie) as CartItem[];
  } catch {
    return [];
  }
}

export async function GET() {
  const cookieStore = cookies();
  const cart = readCart(cookieStore);
  const ids = cart.map((c) => c.movieId);
  const movies = ids.length
    ? await prisma.movie.findMany({
        where: { id: { in: ids } },
        include: { genres: { include: { genre: true } } },
      })
    : [];

  const movieMap = new Map(movies.map((m) => [m.id, m]));

  const items = cart
    .map((c) => ({ ...c, movie: movieMap.get(c.movieId) }))
    .filter((c) => c.movie)
    .map((c) => ({ quantity: c.quantity, movie: c.movie }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { movieId, action } = body as { movieId?: string; action?: string };
  const cookieStore = cookies();
  const cart = readCart(cookieStore);

  if (!movieId || !action) {
    const res = NextResponse.json({ items: [] });
    res.cookies.set("cart", JSON.stringify(cart), { path: "/" });
    return res;
  }

  const idx = cart.findIndex((c) => c.movieId === movieId);
  if (action === "inc") {
    if (idx >= 0) cart[idx].quantity += 1;
    else cart.push({ movieId, quantity: 1 });
  } else if (action === "dec") {
    if (idx >= 0) {
      cart[idx].quantity -= 1;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    }
  } else if (action === "remove") {
    if (idx >= 0) cart.splice(idx, 1);
  }

  // persist cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.set("cart", JSON.stringify(cart), { path: "/" });
  return res;
}
