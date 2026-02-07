import { PageWrapper } from "@/components/PageThemeContext";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { YearFilter } from "@/components";

// Pagination constants
const PAGE_SIZE = 5;

type OrdersPageProps = {
  searchParams?: Record<string, string | string[]>;
};

export default async function ProfileOrdersPage({
  searchParams,
}: OrdersPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const userId = session.user?.id;
  if (!userId) redirect("/sign-in");

  // --- Year filter logic ---
  let filterYear: number | undefined = undefined;
  if (searchParams && searchParams.year) {
    const y = Array.isArray(searchParams.year)
      ? searchParams.year[0]
      : searchParams.year;
    const n = parseInt(y, 10);
    if (!isNaN(n)) filterYear = n;
  }

  // Get all years with orders for this user
  const yearsResult = await prisma.order.findMany({
    where: { userId },
    select: { orderDate: true },
    orderBy: { orderDate: "desc" },
  });
  const yearsSet = new Set<number>();
  yearsResult.forEach((o) => {
    if (o.orderDate) yearsSet.add(new Date(o.orderDate).getFullYear());
  });
  const years = Array.from(yearsSet).sort((a, b) => b - a);

  // Get current page from search params
  let page = 1;
  if (searchParams && searchParams.page) {
    const p = Array.isArray(searchParams.page)
      ? searchParams.page[0]
      : searchParams.page;
    const n = parseInt(p, 10);
    if (!isNaN(n) && n > 0) page = n;
  }

  // Build filter for Prisma
  const where: Prisma.OrderWhereInput = { userId };
  if (filterYear) {
    where.orderDate = {
      gte: new Date(`${filterYear}-01-01T00:00:00.000Z`),
      lt: new Date(`${filterYear + 1}-01-01T00:00:00.000Z`),
    };
  }

  // Get total count for pagination (with filter)
  const totalOrders = await prisma.order.count({ where });
  const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

  // Fetch paginated orders (with filter)
  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { movie: true } },
    },
    orderBy: { orderDate: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-blue-400">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            View your order history and details.
          </p>
        </header>
        {/* Year filter dropdown */}
        <YearFilter years={years} currentYear={filterYear} />

        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-linear-to-br from-neutral-900/80 via-neutral-800/60 to-slate-700/50 rounded-lg overflow-hidden shadow-md"
              >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg text-white">
                      Order #{order.id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-white">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === "PAID" ? "bg-green-900/70 text-green-300" : "bg-yellow-900/70 text-yellow-300"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li
                        key={item.movieId}
                        className="flex items-center gap-4"
                      >
                        <Image
                          src={item.movie.imageUrl ?? "/placeholder.png"}
                          alt={item.movie.title}
                          width={40}
                          height={60}
                          className="rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-200">
                            {item.movie.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-neutral-200">
                          $
                          {Number(
                            Number(item.priceAtPurchase) * item.quantity,
                          ).toFixed(2)}
                        </p>
                        <Link
                          href={`/orders/${order.id}`}
                          className="ml-2 text-blue-400 hover:underline text-sm"
                        >
                          View
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400">
              You have not placed any orders yet.
            </p>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Link
              href={`?${filterYear ? `year=${filterYear}&` : ""}page=${page - 1}`}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${page === 1 ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : 0}
            >
              Previous
            </Link>
            <span className="px-2 text-gray-500">
              Page {page} of {totalPages}
            </span>
            <Link
              href={`?${filterYear ? `year=${filterYear}&` : ""}page=${page + 1}`}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${page === totalPages ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
              aria-disabled={page === totalPages}
              tabIndex={page === totalPages ? -1 : 0}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
