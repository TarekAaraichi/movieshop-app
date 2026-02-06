import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/getServerSession";

export async function rateMovie({
  movieId,
  rating,
}: {
  movieId: string;
  rating: number;
}) {
  const session = await getServerSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  if (rating < 1 || rating > 5) throw new Error("Rating must be 1-5");

  // Upsert user rating
  await prisma.movieRating.upsert({
    where: { movieId_userId: { movieId, userId } },
    update: { rating },
    create: { movieId, userId, rating },
  });

  // Optionally, update Movie's average rating and voteCount
  const ratings = await prisma.movieRating.findMany({ where: { movieId } });
  const avg = ratings.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;
  await prisma.movie.update({
    where: { id: movieId },
    data: { rating: avg, voteCount: ratings.length },
  });

  return { success: true, avg, count: ratings.length };
}
