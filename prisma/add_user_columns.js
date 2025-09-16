const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("Ensuring user table has expected columns...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."user"
      ADD COLUMN IF NOT EXISTS "emailVerified" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "image" text,
      ADD COLUMN IF NOT EXISTS "createdAt" timestamp with time zone DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updatedAt" timestamp with time zone DEFAULT now();
    `);
    console.log("Done.");
  } catch (err) {
    console.error("Error applying SQL:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
