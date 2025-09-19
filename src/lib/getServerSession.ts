import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * getServerSession - helper to read the current auth session in server components/actions.
 * This wraps the configured `auth` instance. In tests, `headers()` may be mocked or
 * absent; we guard accordingly so tests can mock this module via vi.mock.
 */
export async function getServerSession(): Promise<unknown | null> {
  // Next server runtime: use headers for request-scoped session retrieval
  const hdrs =
    typeof headers === "function" ? (headers() as unknown) : undefined;

  // Guard for `auth.api.getSession` shape. We can't import types from better-auth
  // without adding a dependency here, so use safe runtime checks and unknown types.
  const maybeApi = auth as unknown as {
    api?: { getSession?: (...args: unknown[]) => Promise<unknown> };
  };
  if (maybeApi?.api && typeof maybeApi.api.getSession === "function") {
    // Some runtimes return headers() as a Promise or sync value — normalize.
    const maybeHeaders = hdrs instanceof Promise ? await hdrs : hdrs;
    try {
      if (maybeHeaders !== undefined) {
        return await maybeApi.api.getSession({
          headers: maybeHeaders as object,
        });
      }
      return await maybeApi.api.getSession();
    } catch {
      // If session resolution fails, return null so callers can fallback to guest flow.
      return null;
    }
  }

  return null;
}
