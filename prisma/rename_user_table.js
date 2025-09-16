const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Renaming table "User" to "user" if it exists...');
    await prisma.$executeRawUnsafe(
      `DO $$
        BEGIN
          IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User') THEN
            EXECUTE 'ALTER TABLE "public"."User" RENAME TO "user"';
          END IF;
        END;
      $$;`
    );
    console.log("Done.");
  } catch (err) {
    console.error("Error renaming table:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
