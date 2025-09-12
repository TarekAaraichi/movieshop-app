import React from "react";
import { createOrder } from "@/app/actions/orders";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?:
    | Record<string, string>
    | Promise<Record<string, string> | undefined>;
}) {
  const sp = await (searchParams ?? {});
  let serverErrors: string[] = [];
  if (sp?.errors) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sp.errors));
      if (parsed && parsed._type === "validation" && parsed.fields) {
        // flatten validation field messages
        serverErrors = Object.values(
          parsed.fields as Record<string, unknown>
        ).flatMap((f) =>
          Array.isArray(f)
            ? (f as unknown[]).map(String)
            : Object.values(f as Record<string, unknown>).map(String)
        );
      } else if (parsed && parsed._type === "business" && parsed.message) {
        serverErrors = [String(parsed.message)];
      }
    } catch {
      // ignore parse errors
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full my-10">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">Checkout</h1>
        {serverErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
            <ul className="list-disc list-inside text-sm">
              {serverErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <form action={createOrder} method="post" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Full Name
            </label>
            <input
              name="fullName"
              type="text"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="john.doe@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address Line 1
            </label>
            <input
              name="line1"
              type="text"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              name="city"
              type="text"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="City"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                name="postalCode"
                type="text"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="ZIP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                name="country"
                type="text"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Country"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Details
            </label>
            <input
              name="paymentToken"
              type="text"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="simulated-card-token"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Complete Purchase
          </button>
        </form>
      </div>
    </div>
  );
}
