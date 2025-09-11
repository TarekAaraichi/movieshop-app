import CartClient from "./CartClient";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Your Cart</h1>
        <CartClient />
      </div>
    </div>
  );
}
