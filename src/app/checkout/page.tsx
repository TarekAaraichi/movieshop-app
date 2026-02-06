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
  // Track if user has a default address and should show "Save this address" checkbox
  return (
    <PageWrapper>
      <div>
        <div className="w-full m-auto max-w-3xl">
          <Card className="p-8 bg-gradient-to-br from-neutral-900 via-neutral-800 to-indigo-950 border border-indigo-300 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-indigo-400 tracking-tight">
                  Checkout
                </h1>
                <p className="text-base text-neutral-200 mt-2">
                  Confirm your details and securely complete your purchase.
                </p>
              </div>
            </div>

            {serverErrors.length > 0 && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 rounded-lg bg-red-200/90 border border-red-400 text-red-900 px-5 py-4 text-base shadow"
              >
                <ul className="list-disc list-inside space-y-1">
                  {serverErrors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <form
              id="checkout-form"
              action={createOrder}
              className="grid grid-cols-1 gap-6 min-w-0"
              autoComplete="off"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-32 text-base font-medium text-indigo-300">
                    Full name
                  </span>
                  <span className="flex-1 min-w-0 rounded-lg border border-indigo-300 bg-neutral-900 px-4 py-2 text-neutral-100">
                    {dbUser?.name || (
                      <span className="italic text-neutral-500">No name</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-32 text-base font-medium text-indigo-300">
                    Email
                  </span>
                  <span className="flex-1 min-w-0 rounded-lg border border-indigo-300 bg-neutral-900 px-4 py-2 text-neutral-100">
                    {dbUser?.email || (
                      <span className="italic text-neutral-500">No email</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {dbAddress ? (
                  <div className="flex items-start gap-4">
                    <div className="w-32 text-base font-medium text-indigo-300">
                      Address
                    </div>
                    <div className="flex-1">
                      <input
                        type="hidden"
                        name="selectedAddressId"
                        value={dbAddress.id}
                      />
                      <div className="text-base text-neutral-100 space-y-0.5">
                        <div>{dbAddress.line1}</div>
                        {dbAddress.line2 ? <div>{dbAddress.line2}</div> : null}
                        <div>
                          {dbAddress.city} {dbAddress.postalCode}
                        </div>
                        <div>{dbAddress.country}</div>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-base text-indigo-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="useNewAddress"
                        value="1"
                        className="rounded border-indigo-300 text-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:border-white transition"
                        data-toggle-save-address
                      />
                      <span>Deliver to another address</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="w-32 text-base font-medium text-indigo-300">
                      Street
                    </div>
                    <div className="text-base text-indigo-400">
                      Please enter your delivery address below.
                    </div>
                  </div>
                )}

                <div
                  id="address-fields"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                >
                  <label className="flex items-center gap-4 sm:col-span-2 min-w-0">
                    <span className="w-32 text-base font-medium text-indigo-300">
                      Street
                    </span>
                    <input
                      id="line1"
                      name="line1"
                      type="text"
                      placeholder="Street address"
                      defaultValue={dbAddress?.line1 ?? undefined}
                      required
                      className="flex-1 min-w-0 rounded-lg border border-indigo-300 bg-white dark:bg-neutral-900 px-4 py-2 text-neutral-900 dark:text-neutral-100 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
                    />
                  </label>

                  <label className="flex items-center gap-4 min-w-0">
                    <span className="w-32 text-base font-medium text-indigo-300">
                      City
                    </span>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="City"
                      defaultValue={dbAddress?.city ?? undefined}
                      required
                      className="flex-1 min-w-0 rounded-lg border border-indigo-300 bg-white dark:bg-neutral-900 px-4 py-2 text-neutral-900 dark:text-neutral-100 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
                    />
                  </label>

                  <label className="flex items-center gap-4 min-w-0">
                    <span className="w-32 text-base font-medium text-indigo-300">
                      Postal
                    </span>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      placeholder="ZIP"
                      defaultValue={dbAddress?.postalCode ?? undefined}
                      required
                      className="flex-1 min-w-0 rounded-lg border border-indigo-300 bg-white dark:bg-neutral-900 px-4 py-2 text-neutral-900 dark:text-neutral-100 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
                    />
                  </label>

                  <label className="flex items-center gap-4 min-w-0">
                    <span className="w-32 text-base font-medium text-indigo-300">
                      Country
                    </span>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      placeholder="Country"
                      defaultValue={dbAddress?.country ?? undefined}
                      required
                      className="flex-1 min-w-0 rounded-lg border border-indigo-300 bg-white dark:bg-white px-4 py-2 text-neutral-900 dark:text-neutral-100 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                <label className="flex items-center gap-4 sm:col-span-2 min-w-0">
                  <span className="w-32 text-base font-medium text-indigo-300">
                    Payment
                  </span>
                  <input
                    id="paymentToken"
                    name="paymentToken"
                    type="text"
                    placeholder="Card token"
                    required
                    className="flex-1 min-w-0 rounded-lg border border-indigo-300 bg-white dark:bg-neutral-900 px-4 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
                  />
                </label>

                <div className="sm:col-span-1 flex items-center justify-end">
                  <button
                    id="checkout-submit"
                    type="submit"
                    disabled
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Complete Purchase
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 text-sm text-neutral-300">
              <span className="font-medium">Note:</span> Payments are simulated
              for demo purposes. Your card details are never stored.
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
