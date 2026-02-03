import React from "react";
import { OrderMovieRatingClient } from "@/components/OrderMovieRatingClient";
import { rateMovie } from "@/server/actions/movieRatingActions";
import ClearCartOnConfirmation from "../../../components/clearCartOnConfirmation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/getServerSession";

type Props = {
  params: { orderId: string };
};

function formatPrice(p: unknown) {
  if (p == null) return "0.00";
  const maybe = p as { toString?: unknown };
  if (typeof maybe.toString === "function") {
    try {
      return (maybe.toString as () => string)();
    } catch {
      return String(p);
    }
  }
  return String(p);
}

/**
 * Order detail page (ensured)
 * Server-rendered order details for a given order id.
 */

export default async function OrderPage({ params }: Props) {
  const { orderId } = params;
  // Only include the related items and their movies (these fields exist on Order)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { movie: true } },
    },
  });

  if (!order) return notFound();

  // Auth + ownership: use the project's getServerSession helper which normalizes headers
  const session = await getServerSession();
  const s = session as unknown as {
    user?: { id?: string; role?: string };
  } | null;
  if (!s || !s.user)
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent(`/orders/${orderId}`)}`,
    );
  if (order.userId && s.user.id !== order.userId && s.user.role !== "admin") {
    // not the owner nor admin
    redirect("/"); // or throw a 403
  }

  // Load buyer and address explicitly because the Order model exposes userId/addressId
  const buyer =
    order.userId != null
      ? await prisma.user.findUnique({ where: { id: order.userId } })
      : null;
  const address =
    order.addressId != null
      ? await prisma.address.findUnique({ where: { id: order.addressId } })
      : null;

  const total = formatPrice(order.totalAmount);

  type OrderItemLike = {
    movieId: string;
    quantity: number;
    priceAtPurchase: unknown;
    movie?: { imageUrl?: string | null; title?: string | null } | null;
  };

  // Fetch user ratings for movies in this order
  const userId = s?.user?.id;
  const movieIds = order.items.map((it: OrderItemLike) => it.movieId);
  const ratings = userId
    ? await prisma.movieRating.findMany({
        where: { userId, movieId: { in: movieIds } },
      })
    : [];

  function getUserRating(movieId: string) {
    return ratings.find((r) => r.movieId === movieId)?.rating ?? 0;
  }

  async function handleRate(movieId: string, rating: number) {
    "use server";
    await rateMovie({ movieId, rating });
    // Optionally, revalidate or refresh page
  }

  return (
    <div>
      <div className="w-full m-auto max-w-4xl">
        <ClearCartOnConfirmation />
        <div className="bg-gray-900 rounded-2xl shadow-lg ring-1 ring-gray-800 overflow-hidden">
          <div className="p-6 md:p-8 flex items-start justify-between gap-4">
            {/* ...existing code... */}
          </div>
          <div className="border-t border-gray-700 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ...existing code for buyer and address... */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-200 mb-3">Items</h3>
              <div className="space-y-4">
                {order.items.map((it: OrderItemLike) => (
                  <div
                    key={it.movieId}
                    className="flex items-center justify-between gap-4 bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-800">
                        <Image
                          src={
                            it.movie?.imageUrl ||
                            "https://via.placeholder.com/80"
                          }
                          alt={it.movie?.title || "movie"}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-100 truncate">
                          {it.movie?.title}
                        </div>
                        <div className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-700 text-gray-200 text-xs">
                            Qty {it.quantity}
                          </span>
                          <span className="text-xs text-gray-300">
                            Purchased at
                          </span>
                          <span className="font-mono text-gray-100">
                            SEK
                            {Number(formatPrice(it.priceAtPurchase)).toFixed(2)}
                          </span>
                        </div>
                        {/* Rating UI for this movie */}
                        <OrderMovieRatingClient
                          movieId={it.movieId}
                          initialRating={getUserRating(it.movieId)}
                          disabled={!userId}
                          onRateServer={handleRate}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">Line total</div>
                      <div className="text-sm font-semibold text-gray-100">
                        SEK
                        {Number(
                          formatPrice(
                            (it.quantity as number) *
                              Number(formatPrice(it.priceAtPurchase)),
                          ),
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-300">Payment method</div>
                <div className="text-sm font-medium text-gray-100">
                  Card •••• ••••
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
