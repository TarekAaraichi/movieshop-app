import React from "react";
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
    <div >
      <div className="w-full m-auto max-w-4xl">
        <ClearCartOnConfirmation />
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-800 flex items-center gap-3">
                <span>Order Confirmed</span>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Paid
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Order ID
                <span className="ml-2 font-mono text-slate-700">{order.id}</span>
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-500">Total</div>
              <div className="text-2xl font-bold text-slate-900">
                ${Number(total).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-slate-700">Buyer</h2>
                {buyer ? (
                  <div className="mt-2 text-sm text-slate-600 space-y-0.5">
                    <div className="font-medium text-slate-800">{buyer.name}</div>
                    <div className="truncate">{buyer.email}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-600">No buyer information on file</div>
                )}
              </div>

              <div>
                <h2 className="text-sm font-medium text-slate-700">Shipping</h2>
                {address ? (
                  <div className="mt-2 text-sm text-slate-600">
                    <div>{address.line1}</div>
                    {address.line2 && <div>{address.line2}</div>}
                    <div className="mt-1">
                      {address.city} {address.postalCode}
                    </div>
                    <div>{address.country}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-600">No address on file</div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Items</h3>
              <div className="space-y-4">
                {order.items.map((it: OrderItemLike) => (
                  <div
                    key={it.movieId}
                    className="flex items-center justify-between gap-4 bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={it.movie?.imageUrl || "https://via.placeholder.com/80"}
                          alt={it.movie?.title || "movie"}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {it.movie?.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                            Qty {it.quantity}
                          </span>
                          <span className="text-xs">Purchased at</span>
                          <span className="font-mono text-slate-800">
                            ${Number(formatPrice(it.priceAtPurchase)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-600">Line total</div>
                      <div className="text-sm font-semibold text-slate-900">
                        ${Number(formatPrice((it.quantity as number) * Number(formatPrice(it.priceAtPurchase)))).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-slate-600">Payment method</div>
                <div className="text-sm font-medium text-slate-800">Card •••• ••••</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
