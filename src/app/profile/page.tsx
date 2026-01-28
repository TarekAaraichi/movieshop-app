/**
 * Profile page
 * Server component showing the authenticated user's profile and order history.
 */

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components";

export default async function ProfilePage() {
  // require sign-in
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  // prefer id when available; fall back to email
  const userId = session?.user?.id as string | undefined;
  const userEmail = session?.user?.email as string | undefined;

  const baseUser = await prisma.user.findFirst({
    where: userId ? { id: userId } : { email: userEmail ?? undefined },
  });

  // fetch related data separately to match Prisma client types
  const addresses = await prisma.address.findMany({
    where: { userId: baseUser?.id ?? undefined },
  });

  const orders = await prisma.order.findMany({
    where: { userId: baseUser?.id ?? undefined },
    include: {
      items: {
        include: {
          movie: true,
        },
      },
    },
    orderBy: { orderDate: "desc" },
  });

  // compose a single `user` object used by the UI below
  const user = baseUser ? { ...baseUser, addresses, orders } : null;

  if (!user) {
    // If session exists but user record is missing, sign them out then redirect to sign-in
    try {
      await auth.api.signOut({ headers: await headers() });
    } catch {
      // swallow any signOut errors and continue to redirect
    }
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/profile")}`);
  }

  // Using the `user` fetched from the database above for rendering.

  // Build a list of unique addresses by normalized fields so the profile
  // doesn't show duplicate address records that differ only by id but are
  // textually identical (common when an address was stored per-order).
  const normalize = (s: string | undefined | null) =>
    (s ?? "").toString().trim().toLowerCase();
  const addressGroups = new Map<
    string,
    {
      rep: (typeof addresses)[number] | null;
      ids: Set<string>;
      orderCount: number;
    }
  >();
  for (const a of addresses) {
    const key = [a.line1, a.line2, a.city, a.postalCode, a.country]
      .map(normalize)
      .join("|");
    if (!addressGroups.has(key)) {
      addressGroups.set(key, { rep: a, ids: new Set([a.id]), orderCount: 0 });
    } else {
      addressGroups.get(key)!.ids.add(a.id);
    }
  }
  // Map addressId -> key for quick lookup from orders
  const addrIdToKey = new Map<string, string>();
  for (const [k, v] of addressGroups.entries()) {
    for (const id of v.ids) addrIdToKey.set(id, k);
  }
  for (const o of orders) {
    const aid = (o as any).addressId as string | undefined | null;
    if (!aid) continue;
    const k = addrIdToKey.get(aid);
    if (k && addressGroups.has(k)) {
      addressGroups.get(k)!.orderCount++;
    }
  }
  const uniqueAddresses = Array.from(addressGroups.values()).map((g) => ({
    ...((g.rep as any) || {}),
    _orderCount: g.orderCount,
  }));

  return (
      <div>
        <Card className="mx-auto p-6 md:p-10">
          <div className="flex items-center justify-between mb-6 gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-xl shrink-0">
                {(user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100">
                  {user?.name ?? "Your profile"}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-sm text-gray-300">
                    {user?.email ?? "—"}
                  </div>
                  <span
                    className={
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " +
                      (user?.role === "admin"
                        ? "bg-indigo-900/20 text-indigo-300"
                        : "bg-gray-800 text-gray-100")
                    }
                  >
                    {user?.role ?? "user"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-sm bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-2 rounded-md shadow-sm transition"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile/edit"
                className="inline-flex text-gray-100 items-center gap-2 text-sm border border-gray-700 bg-gray-900 px-3 py-2 rounded-md hover:shadow focus:outline-none"
              >
                Edit
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <section className="lg:col-span-2 bg-gray-900 shadow rounded-lg p-6 divide-y divide-gray-800">
              <div className="pb-4">
                <h2 className="font-semibold text-lg text-gray-100">Account</h2>
                <p className="mt-3 text-sm text-gray-300">
                  <span className="font-medium text-gray-200">Name:</span>{" "}
                  <span className="ml-1">{user?.name ?? "—"}</span>
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  <span className="font-medium text-gray-200">Email:</span>{" "}
                  <span className="ml-1">{user?.email ?? "—"}</span>
                </p>
              </div>

              <div className="pt-4">
                <h3 className="font-semibold text-sm text-slate-900 mb-3">
                  Recent Orders
                </h3>
                {user?.orders && user.orders.length ? (
                  <div className="space-y-3">
                    {user.orders.map((o, idx) => {
                      const statusClasses =
                        o.status === "PAID"
                          ? "bg-emerald-900/20 text-emerald-300"
                          : o.status === "PENDING"
                            ? "bg-yellow-900/20 text-yellow-300"
                            : "bg-red-900/20 text-red-300";
                      return (
                        <div
                          key={o.id ?? idx}
                          className="flex items-start justify-between gap-4 p-3 rounded-md hover:shadow-sm transition bg-gray-800 border border-gray-700"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col gap-2">
                              {o.items && o.items.length ? (
                                <div className="flex -space-x-2">
                                  {o.items.slice(0, 3).map((it, i) => (
                                    <Image
                                      key={it.movieId ?? i}
                                      src={it.movie?.imageUrl ?? "/file.svg"}
                                      alt={it.movie?.title ?? "Movie poster"}
                                      width={44}
                                      height={64}
                                      className="object-cover rounded-md border border-gray-700 bg-gray-800"
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="h-14 w-10 bg-gray-800 rounded-md" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-100">
                                Order #{o.id ?? "—"}
                              </div>
                              <div className="text-xs text-gray-300 mt-1">
                                {o.orderDate
                                  ? new Date(o.orderDate).toLocaleString()
                                  : "—"}
                                {" • "}
                                <span
                                  className={
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs " +
                                    statusClasses
                                  }
                                >
                                  {o.status ?? "—"}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-gray-300">
                                {o.items && o.items.length
                                  ? `${o.items.length} item${
                                      o.items.length > 1 ? "s" : ""
                                    }`
                                  : "No items"}
                              </div>
                            </div>
                          </div>

                          <div className="ml-auto text-right flex flex-col items-end gap-2">
                            <div className="text-sm font-semibold text-gray-100">
                              Total
                            </div>
                            <div className="text-lg font-bold text-gray-100">
                              SEK{String(o.totalAmount ?? "0.00")}
                            </div>
                            <Link
                              href={`/orders/${o.id ?? ""}`}
                              className="text-sm text-indigo-400 hover:text-indigo-500"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-300">
                    You have no recent orders.
                  </div>
                )}
              </div>
            </section>

            <section className="bg-gray-900 shadow rounded-lg p-6">
              <h2 className="font-semibold text-lg text-slate-900 mb-3">
                Addresses
              </h2>
              {uniqueAddresses && uniqueAddresses.length ? (
                <div className="grid grid-cols-1 gap-3">
                  {uniqueAddresses.map((a: any, idx) => (
                    <div
                      key={a.id ?? idx}
                      className="border border-gray-700 rounded-md p-3 bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-100">
                            {a.line1}
                          </div>
                          {a.line2 && (
                            <div className="text-sm text-gray-300">
                              {a.line2}
                            </div>
                          )}
                          <div className="text-sm text-gray-300 mt-1">
                            {a.city}, {a.postalCode}, {a.country}
                          </div>
                        </div>
                        {a._orderCount > 0 && (
                          <div className="text-xs text-gray-400">
                            {a._orderCount} order{a._orderCount > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link
                          href="#"
                          className="text-xs text-indigo-400 hover:underline"
                        >
                          Edit
                        </Link>
                        <Link
                          href="#"
                          className="text-xs text-red-400 hover:underline"
                        >
                          Remove
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-300">No saved addresses</div>
              )}
            </section>
          </div>

          <section className="bg-gray-900 shadow rounded-lg p-6">
            <h2 className="font-semibold text-lg text-gray-100 mb-3">
              Order History
            </h2>
            {user?.orders && user.orders.length ? (
              <ul className="divide-y divide-slate-100">
                {user.orders.map((o, idx) => (
                  <li key={o.id ?? idx} className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm text-gray-100 font-medium">
                        Order #{o.id ?? "—"}
                      </div>
                      <div className="text-sm text-gray-300">
                        {o.orderDate
                          ? new Date(o.orderDate).toLocaleDateString()
                          : "—"}
                      </div>
                      <div className="text-sm font-semibold text-gray-100">
                        SEK{String(o.totalAmount ?? "0.00")}
                      </div>
                      <Link
                        href={`/orders/${o.id ?? ""}`}
                        className="text-sm text-indigo-400 hover:text-indigo-500"
                      >
                        Details
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-300">
                You have no orders yet.
              </div>
            )}
          </section>
        </Card>
      </div>
  );
}
