import CartClient from "./CartClient";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import type { CartClientItem } from "@/types";

type CartItem = { movieId: string; quantity: number };

interface CookieStore {
  get?: (name: string) => { value?: string } | undefined;
}

async function readCart(): Promise<CartItem[]> {
  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs = cookieStore as unknown as CookieStore;
  const cartCookie =
    typeof cs.get === "function" ? cs.get("cart")?.value || "[]" : "[]";
  try {
    return JSON.parse(cartCookie) as CartItem[];
  } catch {
    return [];
  }
}

export default async function CartPage() {
  const cart = await readCart();
  /*
    Auth check scaffold (commented out):
    Uncomment and adapt to require sign-in for viewing/storing cart server-side.
    Example:
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect(`/sign-in?callbackUrl=${encodeURIComponent('/cart')}`);
    }
  */
  const ids = cart.map((c) => c.movieId);
  const movies = ids.length
    ? await prisma.movie.findMany({
        where: { id: { in: ids } },
        include: { genres: { include: { genre: true } } },
      })
    : [];

  // Serialize Prisma types (Decimal, Date) into plain JS values for the client
  type DecimalLike = { toString: () => string };
  function isDecimalLike(x: unknown): x is DecimalLike {
    return (
      typeof x === "object" &&
      x !== null &&
      typeof (x as DecimalLike).toString === "function"
    );
  }

  function serializePrice(p: unknown) {
    if (isDecimalLike(p)) return p.toString();
    return String(p ?? "0");
  }

  const serialMovies = movies.map((m) => ({
    ...m,
    price: serializePrice((m as unknown as { price?: unknown }).price),
    releaseDate: m.releaseDate ? m.releaseDate.toISOString() : null,
  }));

  const movieMapSerialized = new Map(serialMovies.map((m) => [m.id, m]));
  const items = cart
    .map((c) => ({
      movie: movieMapSerialized.get(c.movieId),
      quantity: c.quantity,
    }))
    .filter((c) => c.movie) as CartClientItem[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Your Cart</h1>
        {/* pass initial items to client */}
        <CartClient initialItems={items} />
      </div>
    </div>
  );
}
