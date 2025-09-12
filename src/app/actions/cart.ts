"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

type CartItem = { movieId: string; quantity: number };

function parseCart(cookieValue?: string) {
  try {
    return JSON.parse(cookieValue || "[]") as CartItem[];
  } catch {
    return [];
  }
}

export async function addToCart(formData: FormData) {
  const movieId = formData.get("movieId") as string | null;
  if (!movieId) return;

  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart")?.value || "[]";
  const cart = parseCart(cartCookie);

  const idx = cart.findIndex((c) => c.movieId === movieId);
  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ movieId, quantity: 1 });

  cookieStore.set("cart", JSON.stringify(cart), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  }); // 1 week

  revalidatePath("/cart");
}

export async function updateCart(formData: FormData) {
  const movieId = formData.get("movieId") as string | null;
  const action = formData.get("action") as string | null; // 'inc'|'dec'|'remove'
  if (!movieId || !action) return;

  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart")?.value || "[]";
  const cart = parseCart(cartCookie);

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

  if (cart.length === 0) {
    cookieStore.delete("cart");
  } else {
    cookieStore.set("cart", JSON.stringify(cart), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }); // 1 week
  }

  revalidatePath("/cart");
}

// Server action: return cart items with movie records (for server components)
export async function getCartItems() {
  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs = cookieStore as unknown as {
    get?: (name: string) => { value?: string } | undefined;
  };
  const cartCookie =
    typeof cs.get === "function" ? cs.get("cart")?.value || "[]" : "[]";
  let cart: { movieId: string; quantity: number }[] = [];
  try {
    cart = JSON.parse(cartCookie);
  } catch {
    cart = [];
  }

  const ids = cart.map((c) => c.movieId);
  // lazy import prisma to avoid cycles
  const prisma = (await import("@/lib/prisma")).default;
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
  return { items };
}

// Server action: migrate cookie cart items into a user's DB cart
export async function migrateCartToUser(
  userId: string,
  items: { movieId: string; quantity: number }[]
) {
  if (!userId) throw new Error("missing_userId");
  const prisma = (await import("@/lib/prisma")).default;
  // find or create cart
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  // replace items: delete existing and insert new
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  const ops = items.map((i) =>
    prisma.cartItem.create({
      data: { cartId: cart!.id, movieId: i.movieId, quantity: i.quantity },
    })
  );
  await Promise.all(ops);
  // Optionally clear cookie by instructing consuming code to remove it; server actions don't directly control client cookies here
  revalidatePath("/cart");
}

// Hook to call when a user links/signs-in: migrate cookie cart into DB and clear cookie
export async function linkAccountAndMigrate(userId: string) {
  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs = cookieStore as unknown as {
    get?: (name: string) => { value?: string } | undefined;
    set?:
      | ((opts: {
          name: string;
          value: string;
          path?: string;
          maxAge?: number;
        }) => void)
      | ((
          name: string,
          value: string,
          opts?: { path?: string; maxAge?: number }
        ) => void);
    delete?: (name: string) => void;
  };
  const cartCookie =
    typeof cs.get === "function" ? cs.get("cart")?.value || "[]" : "[]";
  let cartItems: { movieId: string; quantity: number }[] = [];
  try {
    cartItems = JSON.parse(cartCookie || "[]");
  } catch {
    cartItems = [];
  }

  if (cartItems.length > 0) {
    await migrateCartToUser(userId, cartItems);
    // clear cookie
    try {
      if (typeof cs.delete === "function") {
        cs.delete("cart");
      } else if (typeof cs.set === "function") {
        // try cookie set to expire using both possible overloads
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
        const setFn = cs.set as unknown as CookieSetObj | CookieSetArgs;
        try {
          (setFn as CookieSetObj)({
            name: "cart",
            value: "",
            path: "/",
            maxAge: 0,
          });
        } catch {
          try {
            (setFn as CookieSetArgs)("cart", "", { path: "/", maxAge: 0 });
          } catch {}
        }
      }
    } catch {}
    revalidatePath("/cart");
  }
}
