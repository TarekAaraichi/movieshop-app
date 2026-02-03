import { PageWrapper } from "@/components/PageThemeContext";
import { OrderMovieRatingClient } from "@/components/OrderMovieRatingClient";
import { rateMovie } from "@/server/actions/movieRatingActions";
import { getServerSession } from "@/lib/getServerSession";
import React from "react";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: { orderId: string };
};

/**
 * Order detail page (ensured)
 * Server-rendered order details for a given order id.
 */

export default async function OrderPage({ params }: Props) {
  const { orderId } = params;
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { movie: true } },
      address: true,
    },
  });
  if (!order) return notFound();

  // Fetch ratings for all movies in this order for this user
  let ratings: Record<string, number> = {};
  if (userId) {
    const ratingsList = await prisma.movieRating.findMany({
      where: {
        userId,
        movieId: { in: order.items.map((i) => i.movieId) },
      },
    });
    ratings = Object.fromEntries(ratingsList.map((r) => [r.movieId, r.rating]));
  }

  async function handleRateServer(movieId: string, rating: number) {
    "use server";
    await rateMovie({ movieId, rating });
  }

  return (
    <PageWrapper>
      <div className="mb-8 flex gap-4 items-center">
        <a
          href="/profile/orders"
          className="inline-block text-emerald-600 hover:underline text-sm font-semibold"
        >
          &larr; Back to My Orders
        </a>
        <a
          href="/profile"
          className="inline-block text-blue-600 hover:underline text-sm"
        >
          Profile
        </a>
      </div>

      <div className="bg-neutral-100 dark:bg-neutral-800/50 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-1">
              Order #{order.id.substring(0, 8)}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Placed on {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                order.status === "PAID"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
              }`}
            >
              {order.status}
            </span>
            <div className="text-lg font-bold text-neutral-800 dark:text-white mt-2">
              ${order.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            Shipping Address
          </h3>
          <div className="text-neutral-700 dark:text-neutral-300">
            {order.address ? (
              <>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.postalCode},{" "}
                  {order.address.country}
                </p>
              </>
            ) : (
              <p>No shipping address found.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            Items
          </h3>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {order.items.map((item) => (
              <li key={item.movieId} className="flex items-center py-4 gap-4">
                <Image
                  src={item.movie.imageUrl ?? "/placeholder.png"}
                  alt={item.movie.title}
                  width={60}
                  height={90}
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {item.movie.title}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Quantity: {item.quantity}
                  </p>
                  <OrderMovieRatingClient
                    movieId={item.movieId}
                    initialRating={ratings[item.movieId] ?? 0}
                    disabled={!userId}
                    onRateServer={handleRateServer}
                  />
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                    ${Number(item.priceAtPurchase).toFixed(2)}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Total: $
                    {(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
