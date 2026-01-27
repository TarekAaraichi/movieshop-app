import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyOrders } from "@/components/EmptyStates";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await auth.api.getSession();
  const userId = session?.user.id;

  if (!userId) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Please sign in</h2>
        <p className="text-gray-400 mb-6">
          You need to be signed in to view your orders.
        </p>
        <Link
          href="/sign-in"
          className="bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          movie: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyOrders />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Order #{order.id.substring(0, 8)}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">Total: ${order.total.toFixed(2)}</p>
                <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                  View Details
                </Link>
              </div>
            </div>
            <div>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center py-2 border-b last:border-b-0">
                  <div className="w-16 h-24 bg-gray-200 rounded-md overflow-hidden mr-4">
                    <img src={item.movie.posterUrl ?? ''} alt={item.movie.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.movie.title}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="ml-auto font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
