-- Add primaryRole to Person
-- CreateEnum
CREATE TYPE "PersonRole" AS ENUM ('DIRECTOR', 'ACTOR');

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "primaryRole" "PersonRole";