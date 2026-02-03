-- AlterTable
ALTER TABLE "public"."Movie" ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "voteCount" INTEGER DEFAULT 0;
