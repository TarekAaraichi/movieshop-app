"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function deleteUser(formData: FormData) {
  const id = formData.get("userId") as string;
  if (!id) throw new Error("Missing user ID");
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function updateUser(formData: FormData) {
  const id = formData.get("userId") as string;
  const name = (formData.get("name") as string) ?? undefined;
  const email = (formData.get("email") as string) ?? undefined;
  if (!id) throw new Error("Missing user ID");
  const data: Partial<{ name: string; email: string }> = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin");
  // After updating a user in the admin UI, redirect back to the users tab.
  // Use server-side redirect (supported in App Router server actions) so the
  // admin UI returns to the users list after save.
  redirect("/admin?tab=users");
}

export async function setUserRole(formData: FormData) {
  const id = formData.get("userId") as string;
  const role = (formData.get("role") as string) ?? "user";
  if (!id) throw new Error("Missing user ID");
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin");
}
