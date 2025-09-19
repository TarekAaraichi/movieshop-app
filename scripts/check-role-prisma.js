const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      take: 2,
      select: { id: true, email: true, role: true },
    });
    console.log("OK", JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("ERROR", err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
