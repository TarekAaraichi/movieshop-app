const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log(
      "Adding nullable password column with default empty string if it does not exist..."
    );
    // Add column if not exists with default empty string
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password text DEFAULT ''`
    );

    console.log("Altering password column to set NOT NULL...");
    // Set NOT NULL (will succeed because default '' is present for existing rows)
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "user" ALTER COLUMN password SET NOT NULL`
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
