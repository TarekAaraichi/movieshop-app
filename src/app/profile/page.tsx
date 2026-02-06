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
import { PageWrapper } from "@/components/PageThemeContext";

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
    const aid = o.addressId;
    if (!aid) continue;
    const k = addrIdToKey.get(aid);
    if (k && addressGroups.has(k)) {
      addressGroups.get(k)!.orderCount++;
    }
  }
  const uniqueAddresses = Array.from(addressGroups.values()).map((g) => ({
    ...(g.rep || {}),
    _orderCount: g.orderCount,
  }));

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            View your account details and order history.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 rounded-lg shadow-md p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src={
                    user.image &&
                    typeof user.image === "string" &&
                    user.image.length > 0
                      ? user.image
                      : user.id
                        ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.id)}`
                        : "/placeholder.png"
                  }
                  alt="User avatar"
                  width={128}
                  height={128}
                  className="rounded-full object-cover border-1 border-neutral-200 dark:border-neutral-700"
                  unoptimized
                />
              </div>
              <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                {user.name}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-600">
                {user.email}
              </p>
              <Link
                href="/profile/edit"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </Link>
              <Link
                href="/profile/orders"
                className="mt-4 ml-2 inline-block bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                My Orders
              </Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
                Shipping Addresses
              </h3>
              <div className="space-y-4">
                {uniqueAddresses.length > 0 ? (
                  uniqueAddresses.map((addr) => (
                    <div key={addr.id} className="bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 rounded-lg p-4">
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {addr.line1}
                      </p>
                      {addr.line2 && (
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {addr.line2}
                        </p>
                      )}
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {addr.city}, {addr.postalCode}, {addr.country}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No addresses found.
                  </p>
                )}
              </div>
            </section>
            {/* Order history moved to /profile/orders */}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
