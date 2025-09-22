"use server";

import { randomUUID } from "crypto";
import type { PrismaClient, User } from "@prisma/client";

export async function findOrCreateUser(
  prismaClient: PrismaClient,
  email: string,
  name: string
): Promise<User> {
  if (!email) throw new Error("email required");
  const existing = await prismaClient.user.findUnique({ where: { email } });
  if (existing) return existing;

  const created = await prismaClient.user.create({
    data: {
      id: randomUUID(),
      email,
      name,
    },
  });
  return created;
}
