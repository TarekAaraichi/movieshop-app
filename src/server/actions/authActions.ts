import { auth } from "@/lib";
import { headers } from "next/headers";

export async function getSessionFromHeaders() {
  // This helper wraps the auth library so server components/actions can call it in a single place.
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}
