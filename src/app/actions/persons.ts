"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";

const personSchema = z.object({
  fullName: z.string().min(1),
  bio: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export async function createPerson(formData: FormData) {
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
  redirect("/admin?tab=persons");
}

export async function updatePerson(formData: FormData) {
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
  const id = formData.get("personId") as string | null;
  if (!id) throw new Error("Missing id");
  await prisma.person.delete({ where: { id } });
  revalidatePath("/admin");
}
