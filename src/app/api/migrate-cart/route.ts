import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * API: migrate-cart (ensured)
 * Server endpoint used during sign-in to migrate anonymous cart to authenticated cart.
 */

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json(
      { ok: false, reason: "no_session" },
      { status: 401 }
    );
  type SessionWithUser = { user?: { id?: string } } | null;
  const userId = (session as SessionWithUser)?.user?.id as string | undefined;
  if (!userId)
    return NextResponse.json(
      { ok: false, reason: "no_user_id" },
      { status: 400 }
    );

  try {
    const { linkAccountAndMigrate } = await import(
      "@/server/actions/cartActions"
    );
    await linkAccountAndMigrate(userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("migrate-cart API failed", e);
    return NextResponse.json(
      { ok: false, reason: "migration_failed" },
      { status: 500 }
    );
  }
}
