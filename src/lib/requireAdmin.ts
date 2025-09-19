import { redirect } from "next/navigation";
import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Server-side guard to require an admin session. Redirects to sign-in if missing,
 * or to root if the user is not an admin.
 */
export async function requireAdmin(callbackUrl = "/admin") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  const s = session as unknown as { user?: { role?: string } } | null;
  if (s?.user?.role !== "admin") {
    redirect("/");
  }
  return session;
}
