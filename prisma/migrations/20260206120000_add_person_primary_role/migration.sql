-- Add primaryRole to Person
-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "primaryRole" "PersonRole" NOT NULL DEFAULT 'ACTOR';