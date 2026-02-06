/**
 * Server action helpers: personsActions
 * Helpers to fetch and mutate person/actor records for pages and admin tools.
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
const prisma = (await import("@/lib/prisma")).default;
import { requireAdmin } from "@/lib/requireAdmin";

const personSchema = z.object({
  fullName: z.string().min(1),
  bio: z.string().optional().nullable(),
  imageUrl: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url().optional().nullable(),
  ),
});

export async function createPerson(formData: FormData) {
  await requireAdmin("/admin?tab=persons");
  const raw = Object.fromEntries(formData.entries());
  const parsed = personSchema.parse(raw);

  await prisma.person.create({
    data: {
      fullName: parsed.fullName.trim(),
      bio: parsed.bio ?? null,
      imageUrl: parsed.imageUrl ?? null,
    },
  });

  revalidatePath("/admin");
  // include created flag and title to show toast in admin UI
  redirect(
    `/admin?tab=persons&created=1&title=${encodeURIComponent(
      parsed.fullName.trim(),
    )}`,
  );
}

export async function updatePerson(formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = personSchema.parse(raw);
  const personId = (raw as Record<string, unknown>).personId as
    | string
    | undefined;
  if (!personId) throw new Error("Missing personId");

  await prisma.person.update({
    where: { id: personId },
    data: {
      fullName: parsed.fullName.trim(),
      bio: parsed.bio ?? null,
      imageUrl: parsed.imageUrl ?? null,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/persons/${personId}/edit`);
  revalidatePath(`/persons/${personId}`);
  // Redirect back to admin persons tab to match movie update UX
  redirect("/admin?tab=persons");
}

export async function deletePerson(formData: FormData) {
  await requireAdmin();
  const id = formData.get("personId") as string | null;
  if (!id) throw new Error("Missing id");
  await prisma.person.delete({ where: { id } });
  revalidatePath("/admin");
}
