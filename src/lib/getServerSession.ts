import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Helper to get server-side session using `better-auth` wrapper in `src/lib/auth`.
 * Returns the session object or null if none.
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session ?? null;
  } catch (err) {
    // swallow and return null to avoid throwing during SSR checks
    return null;
  }
}
