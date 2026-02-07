/**
 * Server helpers: orderHelpersActions
 * Small utilities used by order action flows (totaling, formatting, etc.).
 */

"use server";

import { randomUUID } from "crypto";
import type { User } from "@prisma/client";
const prisma = (await import("@/lib/prisma")).default;

export async function findOrCreateUser(
  email: string,
  name: string,
): Promise<User> {
  if (!email) throw new Error("email required");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const created = await prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      name,
    },
  });
  return created;
}
