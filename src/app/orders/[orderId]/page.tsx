import React from "react";
import ClearCartOnConfirmation from "../clearCartOnConfirmation";
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
      `/sign-in?callbackUrl=${encodeURIComponent(`/orders/${orderId}`)}`
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <ClearCartOnConfirmation />
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Order Confirmed
        </h1>
        <p className="text-sm text-gray-600 mb-4">Order ID: {order.id}</p>

        <div className="border rounded p-4 mb-4">
          <h2 className="font-semibold mb-2 text-gray-800">
            Buyer Information
          </h2>
          {buyer ? (
            <div className="text-sm text-gray-700">
              <div>Name: {buyer.name}</div>
              <div>Email: {buyer.email}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-700">
              No buyer information on file
            </div>
          )}
        </div>

        <div className="border rounded p-4 mb-4">
          <h2 className="font-semibold mb-2 text-gray-800">Shipping Address</h2>
          {address ? (
            <div className="text-sm text-gray-700">
              <div>{address.line1}</div>
              {address.line2 && <div>{address.line2}</div>}
              <div>
                {address.city} {address.postalCode}
              </div>
              <div>{address.country}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-700">No address on file</div>
          )}
        </div>

        <div className="space-y-4">
          {order.items.map((it: OrderItemLike) => (
            <div key={it.movieId} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 relative">
                  <Image
                    src={it.movie?.imageUrl || "https://via.placeholder.com/80"}
                    alt={it.movie?.title || "movie"}
                    fill
                    sizes="64px"
                    className="object-cover rounded-md"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {it.movie?.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    Quantity: {it.quantity}
                  </div>
                </div>
              </div>
              <div className="text-gray-800 font-medium">
                ${Number(formatPrice(it.priceAtPurchase)).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-800">Total</div>
          <div className="text-xl font-bold text-gray-900">
            ${Number(total).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
