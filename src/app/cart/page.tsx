import { CartClient } from "@/components";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib";
import { getCartIdFromCookie } from "@/server/services";
import type { CartClientItem } from "@/types";
import { auth } from "@/lib/auth";

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
  // Prefer DB-backed cart: check authenticated user, then cart-id cookie, then fallback to cookie payload
  const session = await auth.api.getSession({ headers: await headers() });
  type SessionWithUser = { user?: { id?: string } } | null;
  const sessionUserId = (session as SessionWithUser)?.user?.id as
    | string
    | undefined;
  let items: CartClientItem[] = [];

  // 1) If user authenticated, try to load their cart
  if (sessionUserId) {
    const dbCart = await prisma.cart.findUnique({
      where: { userId: sessionUserId },
      include: {
        items: {
          include: {
            movie: { include: { genres: { include: { genre: true } } } },
          },
        },
      },
    });
    if (dbCart && dbCart.items && dbCart.items.length > 0) {
      const serialMovies = dbCart.items.map((ci) => {
        const m = ci.movie as unknown as {
          id: string;
          price?: unknown;
          releaseDate?: Date | null;
        };
        return {
          ...m,
          price: serializePrice(m.price),
          releaseDate: m.releaseDate ? m.releaseDate.toISOString() : null,
        };
      });
      const movieMapSerialized = new Map(serialMovies.map((m) => [m.id, m]));
      items = dbCart.items
        .map((c) => ({
          movie: movieMapSerialized.get(c.movieId),
          quantity: c.quantity,
        }))
        .filter((c) => c.movie) as CartClientItem[];
    }
  }

  // 2) If items still empty, check cart-id cookie and load DB cart by id
  if (!items.length) {
    const cartId = await getCartIdFromCookie();
    if (cartId) {
      const dbCart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              movie: { include: { genres: { include: { genre: true } } } },
            },
          },
        },
      });
      if (dbCart && dbCart.items && dbCart.items.length > 0) {
        const serialMovies = dbCart.items.map((ci) => {
          const m = ci.movie as unknown as {
            id: string;
            price?: unknown;
            releaseDate?: Date | null;
          };
          return {
            ...m,
            price: serializePrice(m.price),
            releaseDate: m.releaseDate ? m.releaseDate.toISOString() : null,
          };
        });
        const movieMapSerialized = new Map(serialMovies.map((m) => [m.id, m]));
        items = dbCart.items
          .map((c) => ({
            movie: movieMapSerialized.get(c.movieId),
            quantity: c.quantity,
          }))
          .filter((c) => c.movie) as CartClientItem[];
      }
    }
  }
  // Helper: Decimal serialization
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

  // If still empty, as a last-resort fallback we will attempt to read legacy cookie payload and migrate it into DB
  if (!items.length) {
    const legacyCart = await readCart();
    if (legacyCart.length > 0 && sessionUserId) {
      const { migrateLegacyToUser } = await import(
        "@/server/actions/cartActions"
      );
      try {
        await migrateLegacyToUser(sessionUserId, legacyCart);
        // after migration, reload user cart
        const dbCart = await prisma.cart.findUnique({
          where: { userId: sessionUserId },
          include: {
            items: {
              include: {
                movie: { include: { genres: { include: { genre: true } } } },
              },
            },
          },
        });
        if (dbCart) {
          const serialMovies = dbCart.items.map((ci) => {
            const m = ci.movie as unknown as {
              id: string;
              price?: unknown;
              releaseDate?: Date | null;
            };
            return {
              ...m,
              price: serializePrice(m.price),
              releaseDate: m.releaseDate ? m.releaseDate.toISOString() : null,
            };
          });
          const movieMapSerialized = new Map(
            serialMovies.map((m) => [m.id, m])
          );
          items = dbCart.items
            .map((c) => ({
              movie: movieMapSerialized.get(c.movieId),
              quantity: c.quantity,
            }))
            .filter((c) => c.movie) as CartClientItem[];
        }
      } catch (_e) {
        console.error("cart migration failed:", _e);
      }
    } else if (legacyCart.length > 0) {
      // guest fallback: migrate legacy cookie into a DB-backed cart so subsequent
      // operations use the server canonical cart (prevents legacy cookie from
      // rehydrating removed items).
      const newCart = await prisma.cart.create({ data: {} });
      if (legacyCart.length > 0) {
        try {
          await prisma.cartItem.createMany({
            data: legacyCart.map((i) => ({
              cartId: newCart.id,
              movieId: i.movieId,
              quantity: i.quantity,
            })),
          });
        } catch {
          // ignore individual insert errors
        }
      }
      // set cookie for future requests
      try {
        const { setCartIdCookie } = await import("@/server/services");
        await setCartIdCookie(newCart.id);
      } catch {}

      // Load movies for the newly created cart to render client props
      const ids = legacyCart.map((c) => c.movieId);
      const movies = ids.length
        ? await prisma.movie.findMany({
            where: { id: { in: ids } },
            include: { genres: { include: { genre: true } } },
          })
        : [];
      const serialMovies = movies.map((m) => ({
        ...m,
        price: serializePrice((m as unknown as { price?: unknown }).price),
        releaseDate: m.releaseDate ? m.releaseDate.toISOString() : null,
      }));
      const movieMapSerialized = new Map(serialMovies.map((m) => [m.id, m]));
      items = legacyCart
        .map((c) => ({
          movie: movieMapSerialized.get(c.movieId),
          quantity: c.quantity,
        }))
        .filter((c) => c.movie) as CartClientItem[];
    }
  }

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
