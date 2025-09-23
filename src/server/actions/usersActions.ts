/**
 * Server action helpers: usersActions
 * Collection of server-side helpers that perform user-related operations used by server routes and pages.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
const prisma = (await import("@/lib/prisma")).default;
import { requireAdmin } from "@/lib/requireAdmin";

export async function deleteUser(formData: FormData) {
  await requireAdmin("/admin?tab=users");
  const id = formData.get("userId") as string;
  if (!id) throw new Error("Missing user ID");
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function updateUser(formData: FormData) {
  await requireAdmin("/admin?tab=users");
  const id = formData.get("userId") as string;
  const name = (formData.get("name") as string) ?? undefined;
  const email = (formData.get("email") as string) ?? undefined;
  const image = (formData.get("image") as string) ?? undefined;
  const addressLine1 = (formData.get("addressLine1") as string) ?? undefined;
  const addressLine2 = (formData.get("addressLine2") as string) ?? undefined;
  const city = (formData.get("city") as string) ?? undefined;
  const postalCode = (formData.get("postalCode") as string) ?? undefined;
  const country = (formData.get("country") as string) ?? undefined;
  if (!id) throw new Error("Missing user ID");
  const data: Partial<{ name: string; email: string; image: string | null }> =
    {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (image !== undefined) data.image = image ?? null;

  await prisma.user.update({ where: { id }, data });

  // If address fields are provided, either create or update a user's Address
  // Note: Address model links to user by userId and is not currently linked
  // directly from User. We'll upsert a simple Address record keyed by userId.
  if (addressLine1 || city || postalCode || country) {
    // Try to find an existing address for this user
    const existing = await prisma.address.findFirst({ where: { userId: id } });
    if (existing) {
      await prisma.address.update({
        where: { id: existing.id },
        data: {
          line1: addressLine1 ?? existing.line1,
          line2: addressLine2 ?? existing.line2,
          city: city ?? existing.city,
          postalCode: postalCode ?? existing.postalCode,
          country: country ?? existing.country,
        },
      });
    } else {
      await prisma.address.create({
        data: {
          line1: addressLine1 ?? "",
          line2: addressLine2 ?? null,
          city: city ?? "",
          postalCode: postalCode ?? "",
          country: country ?? "",
          userId: id,
        },
      });
    }
  }
  revalidatePath("/admin");
  // After updating a user in the admin UI, redirect back to the users tab.
  // Use server-side redirect (supported in App Router server actions) so the
  // admin UI returns to the users list after save.
  redirect("/admin?tab=users");
}

export async function setUserRole(formData: FormData) {
  await requireAdmin("/admin?tab=users");
  const id = formData.get("userId") as string;
  const role = (formData.get("role") as string) ?? "user";
  if (!id) throw new Error("Missing user ID");
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin");
}

// Allow the signed-in user to update their own profile. This action does not
// require admin privileges; instead it extracts the session user id and
// updates the corresponding user record.
export async function updateProfile(formData: FormData) {
  "use server";
  // Access auth and headers inside server action
  const { auth } = await import("@/lib/auth");
  const { headers } = await import("next/headers");

  const session = await auth.api.getSession({ headers: await headers() });
  type SessionWithUser = { user?: { id?: string } } | null;
  const userId = (session as SessionWithUser)?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const name = (formData.get("name") as string) ?? undefined;
  const image = (formData.get("image") as string) ?? undefined;
  const addressLine1 = (formData.get("addressLine1") as string) ?? undefined;
  const addressLine2 = (formData.get("addressLine2") as string) ?? undefined;
  const city = (formData.get("city") as string) ?? undefined;
  const postalCode = (formData.get("postalCode") as string) ?? undefined;
  const country = (formData.get("country") as string) ?? undefined;

  const data: Partial<{ name: string; image: string | null }> = {};
  if (name !== undefined) data.name = name;
  if (image !== undefined) data.image = image ?? null;

  await prisma.user.update({ where: { id: userId }, data });

  // Upsert address similar to admin action
  if (addressLine1 || city || postalCode || country) {
    const existing = await prisma.address.findFirst({ where: { userId } });
    if (existing) {
      await prisma.address.update({
        where: { id: existing.id },
        data: {
          line1: addressLine1 ?? existing.line1,
          line2: addressLine2 ?? existing.line2,
          city: city ?? existing.city,
          postalCode: postalCode ?? existing.postalCode,
          country: country ?? existing.country,
        },
      });
    } else {
      await prisma.address.create({
        data: {
          line1: addressLine1 ?? "",
          line2: addressLine2 ?? null,
          city: city ?? "",
          postalCode: postalCode ?? "",
          country: country ?? "",
          userId,
        },
      });
    }
  }

  // Revalidate profile routes
  revalidatePath("/profile");
  revalidatePath(`/profile/edit`);
  // After a successful profile update, redirect the user back to their
  // public profile so the UI shows the refreshed data.
  redirect("/profile");
}
