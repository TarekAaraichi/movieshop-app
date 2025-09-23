import { redirect } from "next/navigation";
import { auth } from "./auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * requireAdmin
 * Server guard helper that throws/redirects when the current session lacks admin rights.
 */

/**
 * Server-side guard to require an admin session. Redirects to sign-in if missing,
 * or to root if the user is not an admin.
 */
export type RequireAdminResult = {
  session: unknown;
  user: { role?: string; name?: string | null; email?: string | null } | null;
};

export async function requireAdmin(callbackUrl = "/admin") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // session might not include role metadata; fetch role from DB for authoritative check
  type SessionWithUser = { user?: { id?: string } } | null;
  const userId = (session as SessionWithUser)?.user?.id;
  if (!userId) {
    // If session exists but has no user id, conservatively redirect to sign-in
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true, email: true },
  });

  if (dbUser?.role !== "admin") {
    redirect("/");
  }

  return { session, user: dbUser } as RequireAdminResult;
}
