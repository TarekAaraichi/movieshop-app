const { PrismaClient } = require("@prisma/client");
(async () => {
  const prisma = new PrismaClient();
  try {
    const movie = await prisma.movie.findFirst({ where: { isArchived: true } });
    if (movie) {
      await prisma.movie.update({
        where: { id: movie.id },
        data: { isArchived: false },
      });
      console.log("reverted", movie.id);
    } else {
      console.log("no archived movie found");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
