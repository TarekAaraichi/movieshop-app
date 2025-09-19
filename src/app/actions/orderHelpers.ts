import { randomUUID } from "crypto";

export async function findOrCreateUser(
  prismaClient: unknown,
  email: string,
  name: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = prismaClient as any;
  if (!email) throw new Error("email required");
  // try to find existing user by email
  const existing = await p.user.findUnique({ where: { email } });
  if (existing) return existing;

  // create a minimal user record for guest checkout
  const created = await p.user.create({
    data: {
      id: randomUUID(),
      email,
      name,
      // rely on database defaults for createdAt/updatedAt and role
    },
  });
  return created as unknown;
}
