const { PrismaClient } = require("@prisma/client");
(async () => {
  const prisma = new PrismaClient();
  try {
    const movie = await prisma.movie.findFirst();
    console.log(
      "Sample movie before:",
      movie ? { id: movie.id, isArchived: movie.isArchived } : null
    );
    if (movie) {
      await prisma.movie.update({
        where: { id: movie.id },
        data: { isArchived: true },
      });
      const movie2 = await prisma.movie.findUnique({ where: { id: movie.id } });
      console.log("Sample movie after archive:", {
        id: movie2.id,
        isArchived: movie2.isArchived,
      });
      // fetch public listing
      const publicMovies = await prisma.movie.findMany({
        where: { isArchived: false },
        take: 5,
      });
      console.log(
        "Public movies count (should be reduced by 1):",
        publicMovies.length
      );
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
