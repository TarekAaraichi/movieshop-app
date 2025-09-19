const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = "demo@example.com";
  const user = await prisma.user.findUnique({ where: { email } });
  console.log("User:", user);
  if (user) {
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
    });
    console.log("Accounts for userId", user.id, ":", accounts);
  } else {
    console.log("No user found for", email);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
