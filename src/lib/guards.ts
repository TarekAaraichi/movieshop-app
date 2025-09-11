export async function requireAdmin(userId: string | null) {
  if (!userId) return false;
  // Query the database via Prisma to check role. Import prisma client lazily to avoid circular deps.
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  await prisma.$disconnect();
  return user?.role === "admin";
}
