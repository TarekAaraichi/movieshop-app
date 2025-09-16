export async function findOrCreateUser(
  prismaClient: any,
  email: string,
  name: string
) {
  if (!email) throw new Error("email required");
  // try to find existing user by email
  const existing = await prismaClient.user.findUnique({ where: { email } });
  if (existing) return existing;

  // create a minimal user record for guest checkout
  const created = await prismaClient.user.create({
    data: {
      email,
      password: "",
      name,
    },
  });
  return created;
}
