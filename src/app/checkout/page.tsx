import React from "react";
import { createOrder } from "@/server/actions/ordersActions";
import CheckoutFormController from "../../components/CheckoutFormController";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?:
    | Record<string, string>
    | Promise<Record<string, string> | undefined>;
}) {
  const sp = await (searchParams ?? {});

  // Require sign-in for checkout: redirect guests to sign-in and return here on success
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/checkout")}`);
  }

  // Fetch the signed-in user's profile and default address where available
  type SessionWithUser = { user?: { id?: string } } | null;
  const userId = (session as SessionWithUser)?.user?.id;
  let dbUser = null;
  let dbAddress = null;
  if (userId) {
    dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    dbAddress = await prisma.address.findFirst({
      where: { userId },
      orderBy: { id: "asc" },
    });
  }

  // Guests are allowed to view the checkout form. Authentication is enforced
  // at the server-action level (createOrder) which will create or reuse a
  // guest user when no session exists.
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

        <form id="checkout-form" action={createOrder} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </span>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              defaultValue={dbUser?.name ?? undefined}
              required
              className="mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              defaultValue={dbUser?.email ?? undefined}
              required
              className="mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Address Line 1
            </span>
            <input
              id="line1"
              name="line1"
              type="text"
              placeholder="Street address"
              defaultValue={dbAddress?.line1 ?? undefined}
              required
              className="mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </span>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="City"
              defaultValue={dbAddress?.city ?? undefined}
              required
              className="mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Postal Code
              </span>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                placeholder="ZIP"
                defaultValue={dbAddress?.postalCode ?? undefined}
                required
                className="mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </span>
              <input
                id="country"
                name="country"
                type="text"
                placeholder="Country"
                defaultValue={dbAddress?.country ?? undefined}
                required
                className="mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Card Details
            </span>
            <input
              id="paymentToken"
              name="paymentToken"
              type="text"
              placeholder="simulated-card-token"
              required
              className="mt-1 block w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </label>

          <button
            id="checkout-submit"
            type="submit"
            disabled
            className="w-full flex justify-center items-center gap-2 rounded-lg px-4 py-2 text-white font-medium bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Complete Purchase
          </button>
        </form>
        {/* Client controller enables submit when form is valid */}
        <CheckoutFormController
          formId="checkout-form"
          submitId="checkout-submit"
        />
      </div>
    </div>
  );
}
