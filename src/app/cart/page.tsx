import { PageWrapper } from "@/components/PageThemeContext";
/**
 * Cart page
 * Server component that displays full cart contents and checkout actions.
 */

import { CartClient } from "@/components";
import OrderSummaryClient from "@/components/OrderSummaryClient";
import CheckoutSecureButton from "@/components/CheckoutSecureButton";
import { EmptyCart } from "@/components/EmptyStates";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib";
import { getCartIdFromCookie } from "@/server/services";
import type { CartClientItem } from "@/types";
import { auth } from "@/lib/auth";

// Helper: read cart items from legacy cookie payload
type CartItem = { movieId: string; quantity: number };

// CookieStore interface for accessing cookies
interface CookieStore {
  get?: (name: string) => { value?: string } | undefined;
}

// Read cart items from the cookie
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

/**
 * CartPage
 *
 * Server-rendered React component (async) that builds and returns the Shopping Cart page.
 *
 * Overview:
 * - Prefers a DB-backed cart. The resolution order is:
 *   1. If the user is authenticated (session contains user.id), load that user's cart from the DB.
 *   2. Otherwise, if a cart-id cookie exists, load the DB cart by that id.
 *   3. As a last resort, read the legacy cart payload from a cookie and:
 *      - If the user is signed in, attempt to migrate the legacy cookie cart into the user's DB cart.
 *      - If the user is a guest, create a new DB cart, insert the legacy items and set a cart-id cookie.
 *
 * Data handling details:
 * - Movie records are serialized for client transport:
 *   - Decimal-like price values are converted to strings (see serializePrice) to avoid serialization issues.
 *   - Date values (releaseDate) are converted to ISO strings.
 * - A Map is used to efficiently map movie ids to the serialized movie objects when building the
 *   in-memory CartClientItem[] that is passed to the client component.
 * - Migration errors or DB insert errors are caught and logged/ignored to avoid breaking the page render.
 *
 * UI behavior:
 * - If items is empty, shows an empty-cart call-to-action (Browse Movies).
 * - If items exist, renders <CartClient initialItems={items} /> to provide interactive client-side controls.
 * - Displays an order summary with a computed total using the serialized price strings (formatted with Intl.NumberFormat).
 * - Checkout button is disabled when the cart is empty.
 *
 * Notes for collaborators / maintenance tips:
 * - This component runs on the server (async) and performs DB/cookie/session reads — avoid importing heavy client-only code here.
 * - Keep serializePrice and the "Decimal-like" guard stable: various DB drivers (e.g. Prisma) may return Decimal objects that must be stringified.
 * - When adding new fields to movie objects, ensure they are JSON-safe (dates/decimals) or are serialized here before passing to the client.
 * - For testing, simulate the three resolution paths (authenticated DB cart, cart-id cookie, legacy cookie) to validate migrations and cookie-set behavior.
 *
 * @returns JSX.Element The fully-rendered cart page for server-side rendering.
 */
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
      const { migrateLegacyToUser } =
        await import("@/server/actions/cartActions");
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
            serialMovies.map((m) => [m.id, m]),
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
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto px-4 md:px-0 flex flex-col md:flex-row gap-8 items-start">
        <main className="flex-1 bg-linear-to-br from-neutral-900 via-neutral-800 to-slate-700 rounded-2xl shadow-sm p-6 md:p-8 border border-gray-800">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-slate-100">
                Shopping Cart
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage items inline — update quantities, save for later, or
                remove products
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center text-slate-400">
              <EmptyCart />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-400 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200">Cart items</span>
                  {/* <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span> */}
                </div>
                <div className="ml-auto text-xs">Prices shown in SEK</div>
              </div>

              {/* Client-driven interactive cart; keeps controls inline and modern */}
              <div className="rounded-lg border border-slate-700 overflow-hidden">
                <CartClient initialItems={items} />
              </div>
            </div>
          )}
        </main>

        <aside className="w-full md:w-96 sticky top-6 self-start">
          <div className="bg-linear-to-br from-neutral-900 via-neutral-800 to-slate-700 rounded-2xl shadow-sm p-0 border border-gray-800 flex flex-col gap-4 overflow-hidden">
            {/* Order summary card with no extra padding, only inside content */}
            <div className="p-6">
              <OrderSummaryClient items={items} />
            </div>

            <div className="pt-3 border-t border-slate-700 px-6">
              <CheckoutSecureButton initialItems={items} />

              <Link
                href="/movies"
                className="w-full text-center block mt-3 px-4 py-2 rounded-md text-sm text-sky-100 bg-linear-to-r from-sky-800 via-sky-700 to-sky-600 hover:from-sky-700 hover:to-sky-500 transition-shadow"
              >
                Continue shopping
              </Link>
            </div>

            <div className="text-xs text-slate-500 pt-2 px-6 pb-4">
              By checking out you agree to our terms. Payments are processed
              securely.
            </div>
          </div>
        </aside>
      </div>
    </PageWrapper>
  );
}
