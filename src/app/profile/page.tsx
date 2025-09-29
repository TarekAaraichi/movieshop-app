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

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-xl shrink-0">
              {(user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-600">
                {user?.name ?? "Your profile"}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="text-sm text-slate-600">
                  {user?.email ?? "—"}
                </div>
                <span
                  className={
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " +
                    (user?.role === "admin"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-100 text-slate-800")
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
              className="inline-flex text-gray-900 items-center gap-2 text-sm border border-slate-200 bg-white px-3 py-2 rounded-md hover:shadow focus:outline-none"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <section className="lg:col-span-2 bg-white shadow rounded-lg p-6 divide-y divide-slate-100">
            <div className="pb-4">
              <h2 className="font-semibold text-lg text-slate-900">Account</h2>
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-medium text-slate-800">Name:</span>{" "}
                <span className="ml-1">{user?.name ?? "—"}</span>
              </p>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-medium text-slate-800">Email:</span>{" "}
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
                        ? "bg-emerald-100 text-emerald-800"
                        : o.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800";
                    return (
                      <div
                        key={o.id ?? idx}
                        className="flex items-start justify-between gap-4 p-3 rounded-md hover:shadow-sm transition bg-slate-50 border border-slate-100"
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
                                    className="object-cover rounded-md border border-slate-200 bg-white"
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="h-14 w-10 bg-slate-100 rounded-md" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              Order #{o.id ?? "—"}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
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
                            <div className="mt-2 text-sm text-slate-700">
                              {o.items && o.items.length
                                ? `${o.items.length} item${
                                    o.items.length > 1 ? "s" : ""
                                  }`
                                : "No items"}
                            </div>
                          </div>
                        </div>

                        <div className="ml-auto text-right flex flex-col items-end gap-2">
                          <div className="text-sm font-semibold text-slate-900">
                            Total
                          </div>
                          <div className="text-lg font-bold text-slate-900">
                            SEK{String(o.totalAmount ?? "0.00")}
                          </div>
                          <Link
                            href={`/orders/${o.id ?? ""}`}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  You have no recent orders.
                </div>
              )}
            </div>
          </section>

          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="font-semibold text-lg text-slate-900 mb-3">
              Addresses
            </h2>
            {user?.addresses && user.addresses.length ? (
              <div className="grid grid-cols-1 gap-3">
                {user.addresses.map((a, idx) => (
                  <div
                    key={a.id ?? idx}
                    className="border border-slate-100 rounded-md p-3 bg-slate-50"
                  >
                    <div className="text-sm font-medium text-slate-800">
                      {a.line1}
                    </div>
                    {a.line2 && (
                      <div className="text-sm text-slate-700">{a.line2}</div>
                    )}
                    <div className="text-sm text-slate-700 mt-1">
                      {a.city}, {a.postalCode}, {a.country}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href="#"
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href="#"
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-600">No saved addresses</div>
            )}
          </section>
        </div>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="font-semibold text-lg text-slate-900 mb-3">
            Order History
          </h2>
          {user?.orders && user.orders.length ? (
            <ul className="divide-y divide-slate-100">
              {user.orders.map((o, idx) => (
                <li key={o.id ?? idx} className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-800 font-medium">
                      Order #{o.id ?? "—"}
                    </div>
                    <div className="text-sm text-slate-600">
                      {o.orderDate
                        ? new Date(o.orderDate).toLocaleDateString()
                        : "—"}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      SEK{String(o.totalAmount ?? "0.00")}
                    </div>
                    <Link
                      href={`/orders/${o.id ?? ""}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-600">
              You have no orders yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
