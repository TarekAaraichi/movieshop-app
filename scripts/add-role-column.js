const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log(
      "Adding 'role' column to user table if it does not exist (default 'user')..."
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'`
    );

    console.log("Altering 'role' column to set NOT NULL...");
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "user" ALTER COLUMN role SET NOT NULL`
    );

    console.log("Reading user table columns...");
    const cols = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name='user'
      ORDER BY ordinal_position;
    `;

    console.log(JSON.stringify(cols, null, 2));
    console.log("Done.");
  } catch (err) {
    console.error("ERROR while altering DB:", err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
