import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function ProfilePage() {
  // require sign-in
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/profile")}`);
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
    <div className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Your Profile
          </h1>
          <div>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-sm bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        <section className="bg-white shadow-lg rounded-lg p-6 mb-6 border-l-4 border-indigo-200">
          <h2 className="font-semibold text-lg mb-3 text-indigo-800">
            Account
          </h2>
          <p className="text-slate-700 mb-1">
            <span className="font-medium text-slate-800">Name: </span>
            <span className="ml-1">{user?.name ?? "—"}</span>
          </p>
          <p className="text-slate-700 mb-1">
            <span className="font-medium text-slate-800">Email: </span>
            <span className="ml-1">{user?.email ?? "—"}</span>
          </p>
          <p className="text-slate-700">
            <span className="font-medium text-slate-800">Role: </span>
            <span className="ml-1">{user?.role ?? "user"}</span>
          </p>
        </section>

        <section className="bg-white shadow-lg rounded-lg p-6 mb-6 border-l-4 border-emerald-200">
          <h2 className="font-semibold text-lg mb-3 text-emerald-800">
            Addresses
          </h2>
          {user?.addresses && user.addresses.length ? (
            <ul className="space-y-3">
              {user.addresses.map((a) => (
                <li
                  key={a.id ?? Math.random()}
                  className="border rounded p-4 bg-slate-50 border-slate-200"
                >
                  <div className="text-sm text-slate-800 font-medium">
                    {a.line1}
                  </div>
                  {a.line2 && (
                    <div className="text-sm text-slate-700">{a.line2}</div>
                  )}
                  <div className="text-sm text-slate-700">
                    {a.city}, {a.postalCode}, {a.country}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-600">No saved addresses</div>
          )}
        </section>

        <section className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-yellow-200">
          <h2 className="font-semibold text-lg mb-3 text-yellow-800">Orders</h2>
          {user?.orders && user.orders.length ? (
            <div className="space-y-4">
              {user.orders.map((o) => (
                <div
                  key={o.id ?? Math.random()}
                  className="border rounded p-4 flex flex-col md:flex-row md:justify-between bg-slate-50 border-slate-200"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      Order #{o.id ?? "—"}
                    </div>
                    <div className="text-sm text-slate-600">
                      {o.orderDate
                        ? new Date(o.orderDate).toLocaleString()
                        : "—"}{" "}
                      • {o.status ?? "—"}
                    </div>
                    <div className="mt-3 text-sm text-slate-700">
                      {o.items && o.items.length ? (
                        o.items.map((it, idx) => (
                          <div
                            key={it.movieId ?? idx}
                            className="flex justify-between py-1"
                          >
                            <div className="text-slate-800">
                              {it.movie?.title ?? "—"}
                            </div>
                            <div className="text-slate-800">
                              {it.quantity ?? 0} × $
                              {String(it.priceAtPurchase ?? "0.00")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-600">No items</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      Total: ${String(o.totalAmount ?? "0.00")}
                    </div>
                    <Link
                      href={`/profile/orders/${o.id ?? ""}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
