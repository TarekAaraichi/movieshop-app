import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
      <p className="text-gray-400 mb-6">
        Looks like you have not added any movies to your cart yet.
      </p>
      <Link
        href="/movies"
        className="bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700"
      >
        Browse Movies
      </Link>
    </div>
  );
}

export function EmptyOrders() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">You have no orders</h2>
      <p className="text-gray-400 mb-6">You have not made any orders yet.</p>
      <Link
        href="/movies"
        className="bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700"
      >
        Browse Movies
      </Link>
    </div>
  );
}
