"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PersonRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/prisma";

type CartItem = { movieId: string; quantity: number };

interface CookieStore {
  get?: (name: string) => { value?: string } | undefined;
  set?: (name: string, value: string, opts?: { path?: string }) => void;
}

const addToCartSchema = z.object({ movieId: z.string().min(1) });

export async function addToCart(formData: FormData) {
  // validate input
  const raw = Object.fromEntries(formData.entries());
  const parsed = addToCartSchema.safeParse(raw);
  if (!parsed.success) return; // invalid input -> no-op
  const { movieId } = parsed.data;

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
    // `cookies().set` has multiple overloads across runtimes. Try the
    // object form first, fallback to (name, value, opts).
    type CookieSetObj = (opts: {
      name: string;
      value: string;
      path?: string;
    }) => void;
    type CookieSetArgs = (
      name: string,
      value: string,
      opts?: { path?: string }
    ) => void;
    const setFn = cs.set as unknown as CookieSetObj | CookieSetArgs;
    try {
      (setFn as CookieSetObj)({
        name: "cart",
        value: JSON.stringify(cart),
        path: "/",
      });
    } catch {
      (setFn as CookieSetArgs)("cart", JSON.stringify(cart), { path: "/" });
    }
  }
  // ensure cart page revalidation
  revalidatePath("/cart");
}

// Server action to update an existing movie (moved from edit page)
export async function updateMovie(formData: FormData) {
  // We import prisma lazily here to avoid circular deps in some toolchains
  const prisma = (await import("@/lib/prisma")).default;
  const updateMovieSchema = z.object({
    movieId: z.string().min(1),
    title: z.string().min(1),
    releaseDate: z
      .string()
      .refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid date" }),
    description: z.string().min(1),
    director: z.string().min(1),
    actors: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    runtime: z.preprocess(
      (v) => (typeof v === "string" ? parseInt(v, 10) : v),
      z.number().int().nonnegative()
    ),
    price: z.preprocess(
      (v) => (typeof v === "string" ? parseFloat(v) : v),
      z.number().nonnegative()
    ),
    stock: z.preprocess(
      (v) => (typeof v === "string" ? parseInt(v, 10) : v),
      z.number().int().nonnegative()
    ),
    genres: z.string().optional().nullable(),
  });

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateMovieSchema.parse(raw);

  const movieId = parsed.movieId;
  const title = parsed.title;
  const releaseDate = parsed.releaseDate;
  const description = parsed.description;
  const directorName = parsed.director;
  const actorsInput = parsed.actors ?? "";
  const imageUrl = parsed.imageUrl ?? "";
  const runtime = Number(parsed.runtime);
  const price = Number(parsed.price);
  const stock = Number(parsed.stock);
  const genresInput = parsed.genres ?? null;

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
          { personId: director.id, role: PersonRole.DIRECTOR },
          ...actors.map((actor) => ({
            personId: actor.id,
            role: PersonRole.ACTOR,
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

// Movie admin actions: archive, unarchive, delete, create
const movieCreateSchema = z.object({
  title: z.string().min(1),
  releaseDate: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid date" }),
  description: z.string().min(1),
  director: z.string().min(1),
  actors: z.string().optional().nullable(),
  imageUrl: z.string().url().optional(),
  runtime: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v, 10) : v),
    z.number().int().positive()
  ),
  price: z.preprocess(
    (v) => (typeof v === "string" ? parseFloat(v) : v),
    z.number().nonnegative()
  ),
  stock: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v, 10) : v),
    z.number().int().nonnegative()
  ),
  genres: z.string().optional().nullable(),
});

export async function createMovie(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = movieCreateSchema.parse(raw);

  const title = parsed.title;
  const releaseDate = parsed.releaseDate;
  const description = parsed.description;
  const directorName = parsed.director;
  const actorsInput = parsed.actors ?? "";
  const imageUrl = parsed.imageUrl ?? "";
  const runtime = Number(parsed.runtime);
  const price = Number(parsed.price);
  const stock = Number(parsed.stock);
  const genresInput = parsed.genres ?? null;

  // Upsert director
  const director = await prisma.person.upsert({
    where: { fullName: directorName.trim() },
    update: {},
    create: { fullName: directorName.trim() },
  });

  // Upsert actors
  const actorNames = actorsInput
    ? (actorsInput as string)
        .split(",")
        .map((s) => s.trim())
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
    (genresInput as string | null)
      ?.split(",")
      .map((name) => name.trim())
      .filter(Boolean) ?? [];
  const genreRecords = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  // Create movie with all fields and relationships
  await prisma.movie.create({
    data: {
      title,
      description,
      releaseDate: new Date(releaseDate),
      imageUrl,
      runtime,
      price: price.toFixed(2),
      stock,
      people: {
        create: [
          { personId: director.id, role: PersonRole.DIRECTOR },
          ...actors.map((actor) => ({
            personId: actor.id,
            role: PersonRole.ACTOR,
          })),
        ],
      },
      genres: {
        create: genreRecords.map((g) => ({ genreId: g.id })),
      },
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function archiveMovie(formData: FormData) {
  const id = formData.get("movieId") as string;
  if (!id) throw new Error("Missing movie ID");
  await prisma.movie.update({ where: { id }, data: { isArchived: true } });
  revalidatePath("/admin");
}

export async function unarchiveMovie(formData: FormData) {
  const id = formData.get("movieId") as string;
  if (!id) throw new Error("Missing movie ID");
  await prisma.movie.update({ where: { id }, data: { isArchived: false } });
  revalidatePath("/admin");
}

export async function deleteMovie(formData: FormData) {
  const id = formData.get("movieId") as string;
  if (!id) throw new Error("Missing movie ID");
  const orderRefs = await prisma.orderItem.count({ where: { movieId: id } });
  if (orderRefs > 0) {
    throw new Error(
      "Cannot delete movie: it has associated orders. Remove related orders or keep the movie for order history."
    );
  }
  await prisma.cartItem.deleteMany({ where: { movieId: id } });
  await prisma.movie.delete({ where: { id } });
  revalidatePath("/admin");
}
