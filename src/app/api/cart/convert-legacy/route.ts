import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import prisma from "@/lib/prisma";
import * as cartService from "@/server/services";
import { auth } from "@/lib/auth";

/**
 * API: /api/cart/convert-legacy
 * Utility route to convert legacy cookie payloads to the current cart DTO format.
 */

export async function POST() {
  // Read legacy cookie value
  const maybeCookies = cookies();
  const cookieStore =
    typeof (maybeCookies as unknown as Promise<unknown>).then === "function"
      ? await maybeCookies
      : maybeCookies;
  const cs = cookieStore as unknown as {
    get?: (n: string) => { value?: string };
  };
  const legacy =
    typeof cs.get === "function" ? cs.get("cart")?.value || "[]" : "[]";
  let items: { movieId: string; quantity: number }[] = [];
  try {
    try {
      console.log("[api/cart/convert-legacy] legacy cookie raw:", legacy);
    } catch {}
    items = JSON.parse(legacy || "[]");
  } catch {
    items = [];
  }

  // If there's an authenticated user, merge cookie cart id or legacy payload into their cart
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id) {
      const userId = session.user.id;
      try {
        console.log(
          "[api/cart/convert-legacy] merging into user cart",
          userId,
          "incomingItems:",
          items.length,
        );
      } catch {}

      // First, if the cookie contains a cart id that references a DB cart, merge that
      try {
        const rawCookie =
          typeof cs.get === "function" ? cs.get("cart")?.value : undefined;
        let cookieVal: string | undefined = undefined;
        try {
          if (rawCookie && typeof rawCookie === "string") {
            try {
              cookieVal = decodeURIComponent(rawCookie);
            } catch {
              cookieVal = rawCookie;
            }
          }
        } catch {}
        try {
          console.log(
            "[api/cart/convert-legacy] cookie raw:",
            rawCookie ?? null,
            "decoded:",
            cookieVal ?? null,
          );
        } catch {}

        const looksLikeJson =
          typeof cookieVal === "string" && cookieVal.trim().startsWith("[");
        if (cookieVal && !looksLikeJson) {
          try {
            await cartService.mergeCartIntoUser(userId, cookieVal);
            const cookieObj = cookieStore as unknown as {
              delete?: (name: string) => void;
            };
            if (typeof cookieObj.delete === "function")
              cookieObj.delete("cart");
          } catch (e) {
            console.error(
              "[api/cart/convert-legacy] mergeCartIntoUser failed:",
              e,
            );
          }
        } else if (looksLikeJson && items.length > 0) {
          try {
            // Prefer the guest-provided legacy snapshot and replace any existing
            // user cart contents when converting a fresh legacy payload.
            await cartService.mergeLegacyIntoUser(userId, items, {
              replaceExisting: true,
            });
            const cookieObj = cookieStore as unknown as {
              delete?: (name: string) => void;
            };
            if (typeof cookieObj.delete === "function")
              cookieObj.delete("cart");
          } catch (e) {
            console.error(
              "[api/cart/convert-legacy] mergeLegacyIntoUser failed:",
              e,
            );
          }
        } else {
          try {
            console.log(
              "[api/cart/convert-legacy] nothing to merge: cookieVal present?",
              !!cookieVal,
              "items.length:",
              items.length,
            );
          } catch {}
        }
      } catch (cookieErr) {
        console.error(
          "[api/cart/convert-legacy] cookie merge attempt failed:",
          cookieErr,
        );
      }

      // Return the user's canonical cart DTO so client can adopt it immediately
      const userCart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });
      if (userCart) {
        const dto = await cartService.toDto(
          userCart as unknown as {
            id: string;
            items?: { movieId: string; quantity: number }[];
          },
        );
        return NextResponse.json(dto);
      }
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    console.error("[api/cart/convert-legacy] session check failed:", e);
  }

  // If there is no authenticated session, do not create an anonymous cart
  // here — leave the legacy cookie intact so it can be migrated when a
  // session is available (for example, during the next server-rendered
  // request where headers/session are present). Creating an anonymous cart
  // at this point can lead to the legacy cookie being replaced and then
  // the user's cart being lost if the migration happened before the
  // authentication cookie was established.
  return NextResponse.json({ ok: true, migrated: false });
}
