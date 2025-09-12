import React from "react";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: { orderId: string };
};

function formatPrice(p: unknown) {
  if (p == null) return "0.00";
  try {
    // Prisma Decimal -> string
    return (p as { toString?: () => string }).toString();
  } catch {
    return String(p);
  }
}

export default async function OrderPage({ params }: Props) {
  const { orderId } = params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { movie: true } }, address: true },
  });

  if (!order) return notFound();

  const total = formatPrice(order.totalAmount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Order Confirmed</h1>
        <p className="text-sm text-gray-600 mb-4">Order ID: {order.id}</p>

        <div className="border rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          {order.address ? (
            <div className="text-sm text-gray-700">
              <div>{order.address.line1}</div>
              {order.address.line2 && <div>{order.address.line2}</div>}
              <div>
                {order.address.city} {order.address.postalCode}
              </div>
              <div>{order.address.country}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-700">No address on file</div>
          )}
        </div>

        <div className="space-y-4">
          {order.items.map((it) => (
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
                  <div className="font-semibold text-gray-800">{it.movie?.title}</div>
                  <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                </div>
              </div>
              <div className="text-gray-800 font-medium">
                ${Number(formatPrice(it.priceAtPurchase)).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-lg font-semibold">Total</div>
          <div className="text-xl font-bold text-gray-900">${Number(total).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
