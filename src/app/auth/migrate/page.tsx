import { redirect } from "next/navigation";
import { linkAccountAndMigrate } from "@/app/actions/cart";

export default async function Page({
  searchParams,
}: {
  searchParams?: { userId?: string; returnUrl?: string };
}) {
  const userId = searchParams?.userId;
  const returnUrl = searchParams?.returnUrl ?? "/";
  if (!userId) {
    // missing user id -> send back
    redirect(returnUrl);
    return null;
  }

  try {
    await linkAccountAndMigrate(userId);
  } catch {
    // swallow and redirect back; you may expand this to show an error page
  }

  // After migration redirect back
  redirect(returnUrl);
  return null;
}
