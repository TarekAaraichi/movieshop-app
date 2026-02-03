/**
 * Checkout page
 * Server component coordinating checkout form and payment flow.
 */

import React from "react";
import { createOrder } from "@/server/actions/ordersActions";
import CheckoutFormController from "../../components/CheckoutFormController";
import AddressSelectorClient from "@/components/AddressSelectorClient";
import { Card } from "@/components";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PageWrapper } from "@/components/PageThemeContext";

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
  let dbAddresses: {
    id: string;
    line1: string;
    city: string;
    postalCode: string;
    country: string;
    line2?: string | null;
  }[] = [];
  if (userId) {
    dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    dbAddress = await prisma.address.findFirst({
      where: { userId },
      orderBy: { id: "asc" },
    });
    dbAddresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        line1: true,
        line2: true,
        city: true,
        postalCode: true,
        country: true,
      },
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
          parsed.fields as Record<string, unknown>,
        ).flatMap((f) =>
          Array.isArray(f)
            ? (f as unknown[]).map(String)
            : Object.values(f as Record<string, unknown>).map(String),
        );
      } else if (parsed && parsed._type === "business" && parsed.message) {
        serverErrors = [String(parsed.message)];
      }
    } catch {
      // ignore parse errors
    }
  }
  return (
    <PageWrapper>
    <div>
      <div className="w-full m-auto max-w-3xl">
        <Card className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-100">Checkout</h1>
              <p className="text-sm text-gray-400 mt-1">
                Review your details and complete payment
              </p>
            </div>
          </div>

          {serverErrors.length > 0 && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm"
            >
              <ul className="list-disc list-inside">
                {serverErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <form
            id="checkout-form"
            action={createOrder}
            className="grid grid-cols-1 gap-4 sm:gap-6 min-w-0"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-4 min-w-0">
                <span className="w-28 text-sm font-medium text-gray-300">
                  Full name
                </span>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  defaultValue={dbUser?.name ?? undefined}
                  required
                  className="flex-1 min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </label>

              <label className="flex items-center gap-4 min-w-0">
                <span className="w-28 text-sm font-medium text-gray-300">
                  Email
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  defaultValue={dbUser?.email ?? undefined}
                  required
                  className="flex-1 min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {dbAddress ? (
                <div className="flex items-start gap-4">
                  <div className="w-28 text-sm font-medium text-gray-300">
                    Address
                  </div>
                  <div className="flex-1">
                    <input
                      type="hidden"
                      name="selectedAddressId"
                      value={dbAddress.id}
                    />
                    <div className="text-sm text-gray-100">
                      <div>{dbAddress.line1}</div>
                      {dbAddress.line2 ? <div>{dbAddress.line2}</div> : null}
                      <div>
                        {dbAddress.city} {dbAddress.postalCode}
                      </div>
                      <div>{dbAddress.country}</div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      name="useNewAddress"
                      value="1"
                      className="rounded"
                    />
                    Deliver to another address
                  </label>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-28 text-sm font-medium text-gray-300">
                    Street
                  </div>
                  <div className="text-sm text-gray-100">
                    Please enter your delivery address below
                  </div>
                </div>
              )}

              <div
                id="address-fields"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <label className="flex items-center gap-4 sm:col-span-2 min-w-0">
                  <span className="w-28 text-sm font-medium text-gray-300">
                    Street
                  </span>
                  <input
                    id="line1"
                    name="line1"
                    type="text"
                    placeholder="Street address"
                    defaultValue={dbAddress?.line1 ?? undefined}
                    required
                    className="flex-1 min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </label>

                <label className="flex items-center gap-4 min-w-0">
                  <span className="w-28 text-sm font-medium text-gray-300">
                    City
                  </span>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City"
                    defaultValue={dbAddress?.city ?? undefined}
                    required
                    className="flex-1 min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </label>

                <label className="flex items-center gap-4 min-w-0">
                  <span className="w-28 text-sm font-medium text-gray-300">
                    Postal
                  </span>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    placeholder="ZIP"
                    defaultValue={dbAddress?.postalCode ?? undefined}
                    required
                    className="flex-1 min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </label>

                <label className="flex items-center gap-4 min-w-0">
                  <span className="w-28 text-sm font-medium text-gray-300">
                    Country
                  </span>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    placeholder="Country"
                    defaultValue={dbAddress?.country ?? undefined}
                    required
                    className="flex-1 min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <label className="flex items-center gap-4 sm:col-span-2 min-w-0">
                <span className="w-28 text-sm font-medium text-gray-300">
                  Payment
                </span>
                <input
                  id="paymentToken"
                  name="paymentToken"
                  type="text"
                  placeholder="card token"
                  required
                  className="flex-1 min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </label>

              <div className="sm:col-span-1 flex items-center justify-end">
                <button
                  id="checkout-submit"
                  type="submit"
                  disabled
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Complete purchase
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-28" />
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  name="saveAddress"
                  value="1"
                  className="rounded"
                />
                Save this address to my profile
              </label>
            </div>
          </form>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Payments are simulated for demo purposes. Your card details are not
            stored.
          </div>
        </Card>

        {/* Client controller enables submit when form is valid */}
        <CheckoutFormController
          formId="checkout-form"
          submitId="checkout-submit"
        />
        <AddressSelectorClient formId="checkout-form" />
      </div>
    </div>
    </PageWrapper>
  );
}
