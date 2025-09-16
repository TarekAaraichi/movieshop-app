const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("Adding isArchived column to Movie (if not exists)...");
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Movie" ADD COLUMN IF NOT EXISTS "isArchived" boolean DEFAULT false;'
    );
    console.log("Done.");
  } catch (err) {
    console.error("Error applying SQL:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
