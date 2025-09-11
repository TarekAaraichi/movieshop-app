"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type CartItem = { movieId: string; quantity: number };

interface CookieStore {
  get?: (name: string) => { value?: string } | undefined;
  set?: (name: string, value: string, opts?: { path?: string }) => void;
}

export async function addToCart(formData: FormData) {
  const movieId = formData.get("movieId") as string | null;
  if (!movieId) return;

  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs = cookieStore as unknown as CookieStore;
  const cartCookie =
    typeof cs.get === "function" ? cs.get("cart")?.value || "[]" : "[]";
  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(cartCookie);
  } catch {
    cart = [];
  }

  const idx = cart.findIndex((c) => c.movieId === movieId);
  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ movieId, quantity: 1 });

  if (typeof cs.set === "function") {
    try {
      (cs as any).set({ name: "cart", value: JSON.stringify(cart), path: "/" });
    } catch {
      (cs as any).set("cart", JSON.stringify(cart), { path: "/" });
    }
  }
  // ensure cart page revalidation
  revalidatePath("/cart");

  // keep user on the same movie page after adding
  redirect(`/movies/${movieId}`);
}

// Server action to update an existing movie (moved from edit page)
export async function updateMovie(formData: FormData) {
  // We import prisma lazily here to avoid circular deps in some toolchains
  const prisma = (await import("@/lib/prisma")).default;

  const movieId = formData.get("movieId") as string; // hidden field
  const title = (formData.get("title") as string) || "";
  const releaseDate = formData.get("releaseDate") as string;
  const description = (formData.get("description") as string) || "";
  const directorName = (formData.get("director") as string) || "";
  const actorsInput = (formData.get("actors") as string) || "";
  const imageUrl = (formData.get("imageUrl") as string) || "";
  const runtime = parseInt((formData.get("runtime") as string) || "0", 10);
  const price = parseFloat((formData.get("price") as string) || "0");
  const stock = parseInt((formData.get("stock") as string) || "0", 10);
  const genresInput = (formData.get("genres") as string) || null;

  // Upsert director
  const director = await prisma.person.upsert({
    where: { fullName: directorName.trim() },
    update: {},
    create: { fullName: directorName.trim() },
  });

  // Upsert actors
  const actorNames = actorsInput
    ? actorsInput
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
    : [];
  const actors = await Promise.all(
    actorNames.map((name) =>
      prisma.person.upsert({
        where: { fullName: name },
        update: {},
        create: { fullName: name },
      })
    )
  );

  // Upsert genres
  const genreNames =
    genresInput
      ?.split(",")
      .map((n) => n.trim())
      .filter(Boolean) ?? [];
  const genreRecords = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  // Update the movie and replace relations
  await prisma.movie.update({
    where: { id: movieId },
    data: {
      title,
      description,
      releaseDate: new Date(releaseDate),
      imageUrl,
      runtime,
      price: price.toFixed(2),
      stock,
      people: {
        deleteMany: {},
        create: [
          { personId: director.id, role: "DIRECTOR" as const },
          ...actors.map((actor) => ({
            personId: actor.id,
            role: "ACTOR" as const,
          })),
        ],
      },
      genres: {
        deleteMany: {},
        create: genreRecords.map((g) => ({ genreId: g.id })),
      },
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}
