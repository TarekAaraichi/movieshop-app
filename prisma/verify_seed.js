const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verify() {
  try {
    const movies = await prisma.movie.findMany({
      select: { id: true, title: true },
    });
    let allGood = true;
    for (const m of movies) {
      const actorCount = await prisma.moviePerson.count({
        where: { movieId: m.id, role: "ACTOR" },
      });
      console.log(`${m.title} (${m.id}): ACTOR count = ${actorCount}`);
      if (actorCount < 2) {
        console.error(`-> ERROR: '${m.title}' has fewer than 2 actors`);
        allGood = false;
      }
    }
    if (allGood) {
      console.log("\nVerification passed: every movie has >= 2 actors.");
      process.exit(0);
    } else {
      console.error(
        "\nVerification failed: one or more movies have < 2 actors."
      );
      process.exit(2);
    }
  } catch (e) {
    console.error("Verification script error:", e);
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
