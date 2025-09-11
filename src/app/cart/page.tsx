import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type CartItem = { movieId: string; quantity: number };

async function updateCart(formData: FormData) {
  "use server";
  const movieId = formData.get("movieId") as string | null;
  const action = formData.get("action") as string | null; // 'inc' | 'dec' | 'remove'

  if (!movieId || !action) return redirect("/cart");

  const cookieStore = cookies();
  const cartCookie = cookieStore.get("cart")?.value || "[]";
  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(cartCookie);
  } catch {
    cart = [];
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

  cookieStore.set("cart", JSON.stringify(cart), { path: "/" });
  revalidatePath("/cart");
  redirect("/cart");
}

export default async function CartPage() {
  // Read cart cookie and fetch movie details
  const cookieStore = cookies();
  const cartCookie = cookieStore.get("cart")?.value || "[]";
  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(cartCookie);
  } catch {
    cart = [];
  }

  const ids = cart.map((c) => c.movieId);
  const movies = ids.length
    ? await prisma.movie.findMany({ where: { id: { in: ids } } })
    : [];

  // Build a map for quick lookup
  const movieMap = new Map(movies.map((m) => [m.id, m]));

  const items = cart
    .map((c) => ({ ...c, movie: movieMap.get(c.movieId) }))
    .filter((c) => c.movie);

  const total = items.reduce(
    (sum, it) => sum + Number(it.movie.price) * it.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Your Cart</h1>

        {items.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {items.map(({ movie, quantity }) => (
              <div
                key={movie.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={movie.imageUrl || "https://via.placeholder.com/80"}
                    alt={movie.title}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-blue-500">
                      {movie.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Category: {movie.genres?.[0]?.genre?.name ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-lg font-medium text-gray-800">
                    ${Number(movie.price).toFixed(2)}
                  </p>
                  <form action={updateCart}>
                    <input type="hidden" name="movieId" value={movie.id} />
                    <button
                      name="action"
                      value="dec"
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      −
                    </button>
                  </form>
                  <span className="px-3">{quantity}</span>
                  <form action={updateCart}>
                    <input type="hidden" name="movieId" value={movie.id} />
                    <button
                      name="action"
                      value="inc"
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </form>
                  <form action={updateCart}>
                    <input type="hidden" name="movieId" value={movie.id} />
                    <button
                      name="action"
                      value="remove"
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-800">
                Total: ${total.toFixed(2)}
              </p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
