// using native Response for redirects in this route to avoid runtime redirect issues
import { cookies, headers } from "next/headers";
import * as cartService from "@/server/services";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const callback = url.searchParams.get("callback") || "/profile";
  let didMerge = false;

  try {
    // Read legacy cookie value (may be URL-encoded JSON or a cart id)
    const cookieStore = cookies();
    const cs =
      typeof (cookieStore as unknown as Promise<unknown>).then === "function"
        ? await cookieStore
        : cookieStore;
    const cookieObj = cs as unknown as {
      get?: (n: string) => { value?: string };
      delete?: (n: string) => void;
    };
    const rawLegacy =
      typeof cookieObj.get === "function"
        ? cookieObj.get("cart")?.value
        : undefined;
    let items: { movieId: string; quantity: number }[] = [];
    // If cookie is encoded JSON (we encode on the client), decode before parsing
    if (rawLegacy && typeof rawLegacy === "string") {
      let decodedLegacy: string | undefined = undefined;
      try {
        decodedLegacy = decodeURIComponent(rawLegacy);
      } catch {
        decodedLegacy = rawLegacy;
      }
      try {
        items = JSON.parse(decodedLegacy || "[]");
      } catch (parseErr) {
        console.error(
          "[api/cart/migrate-and-continue] failed to parse legacy cookie",
          parseErr
        );
        items = [];
      }
    }

    try {
      console.log(
        "[api/cart/migrate-and-continue] incoming legacy cookie length:",
        typeof rawLegacy === "string" ? rawLegacy.length : 0
      );
    } catch {}

    // If authenticated, merge legacy into user cart
    // Use headers() directly (do not await) — better compatibility with auth.api.getSession
    let session: unknown = null;
    try {
      const hdr = headers();
      session = await auth.api.getSession({
        headers: hdr as unknown as Headers,
      });
      try {
        const sTmp = session as { user?: { id?: string } } | null;
        console.log(
          "[api/cart/migrate-and-continue] session userId:",
          sTmp?.user?.id ?? null
        );
      } catch {}
    } catch (sessionErr) {
      console.error(
        "[api/cart/migrate-and-continue] auth.api.getSession failed:",
        sessionErr
      );
      session = null;
    }
    // (didMerge is declared above and set when merge occurs)
    const s = session as { user?: { id?: string } } | null;
    if (s?.user?.id) {
      try {
        // Inspect cookie value and try to detect JSON payload vs DB cart id.
        const rawCookieVal =
          typeof cookieObj.get === "function"
            ? cookieObj.get("cart")?.value
            : undefined;
        let cookieVal: string | undefined = undefined;
        try {
          if (rawCookieVal && typeof rawCookieVal === "string") {
            try {
              cookieVal = decodeURIComponent(rawCookieVal);
            } catch {
              cookieVal = rawCookieVal;
            }
          }
        } catch {}
        try {
          console.log(
            "[api/cart/migrate-and-continue] cookie raw:",
            rawCookieVal ?? null,
            "decoded:",
            cookieVal ?? null
          );
        } catch {}

        // If cookie value decodes to a JSON array, treat it as legacy payload; otherwise treat as cart id.
        const looksLikeJson =
          typeof cookieVal === "string" && cookieVal.trim().startsWith("[");
        if (cookieVal && !looksLikeJson) {
          try {
            await cartService.mergeCartIntoUser(s.user.id!, cookieVal);
            didMerge = true;
            try {
              if (typeof cookieObj.delete === "function")
                cookieObj.delete("cart");
            } catch {}
          } catch (e) {
            console.error(
              "[api/cart/migrate-and-continue] mergeCartIntoUser failed:",
              e
            );
          }
        } else if (looksLikeJson && items.length > 0) {
          try {
            // When the cookie contains a fresh legacy JSON snapshot (taken just
            // before auth), prefer the guest snapshot and replace any existing
            // user cart contents to avoid re-introducing older stored items.
            await cartService.mergeLegacyIntoUser(s.user.id!, items, {
              replaceExisting: true,
            });
            didMerge = true;
            try {
              if (typeof cookieObj.delete === "function")
                cookieObj.delete("cart");
            } catch {}
          } catch (mergeErr) {
            console.error(
              "[api/cart/migrate-and-continue] mergeLegacyIntoUser failed:",
              mergeErr
            );
          }
        } else {
          try {
            console.log(
              "[api/cart/migrate-and-continue] nothing to merge: cookieVal present?",
              !!cookieVal,
              "items.length:",
              items.length
            );
          } catch {}
        }
      } catch (e) {
        console.error(
          "[api/cart/migrate-and-continue] cookie read/merge failed:",
          e
        );
      }
    }
  } catch (err) {
    // Catch-all to avoid returning HTTP 500 to the browser. Log and continue to redirect.
    console.error("[api/cart/migrate-and-continue] unexpected error:", err);
  }

  // Always redirect the user back to the requested callback so flow continues.
  // Validate callback to avoid open redirects and ensure it's a path starting with '/'.
  try {
    const safeCallback =
      typeof callback === "string" && callback.startsWith("/")
        ? callback
        : "/profile";
    // If we merged items server-side, add a query param so the client can revalidate
    const separator = safeCallback.includes("?") ? "&" : "?";
    const redirectTarget = didMerge
      ? `${safeCallback}${separator}migrated=1`
      : safeCallback;
    console.log(
      "[api/cart/migrate-and-continue] redirecting to:",
      redirectTarget
    );
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTarget,
      },
    });
  } catch (redirectErr) {
    console.error(
      "[api/cart/migrate-and-continue] redirect failed:",
      redirectErr
    );
    return new Response(
      JSON.stringify({ ok: false, error: "redirect_failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
