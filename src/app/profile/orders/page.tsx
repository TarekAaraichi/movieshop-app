import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PageWrapper } from "@/components/PageThemeContext";

export default async function ProfileOrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const userId = session?.user?.id as string | undefined;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { movie: true } },
    },
    orderBy: { orderDate: "desc" },
  });

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            View your order history and details.
          </p>
        </header>
        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-neutral-100 dark:bg-neutral-800/50 rounded-lg overflow-hidden"
              >
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg text-neutral-800 dark:text-white">
                      Order #{order.id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-neutral-800 dark:text-white">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === "PAID" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"}`}
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
                          <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {item.movie.title}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                          $
                          {Number(item.priceAtPurchase * item.quantity).toFixed(
                            2,
                          )}
                        </p>
                        <Link
                          href={`/orders/${order.id}`}
                          className="ml-2 text-blue-600 hover:underline text-sm"
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
              You haven't placed any orders yet.
            </p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
