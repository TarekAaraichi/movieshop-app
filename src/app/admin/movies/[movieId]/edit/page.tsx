import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { notFound } from "next/navigation";
import EditMovieForm from "./EditMovieForm";

export default async function EditMoviePage({
  params: { movieId },
}: {
  params: { movieId: string };
}) {
  await requireAdmin();
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      people: { include: { person: true } },
      genres: { include: { genre: true } },
    },
  });

  if (!movie) {
    return notFound();
  }

  return <EditMovieForm movie={movie} />;
}
