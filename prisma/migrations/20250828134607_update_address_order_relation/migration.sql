/*
  Warnings:

  - You are about to drop the column `orderId` on the `Address` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_orderId_fkey";

-- DropIndex
DROP INDEX "public"."Address_orderId_key";

-- AlterTable
ALTER TABLE "public"."Address" DROP COLUMN "orderId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "addressId" TEXT;

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "public"."Address"("userId");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
