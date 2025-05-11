/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Beneficiary` table. All the data in the column will be lost.
  - Added the required column `policy_number` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Beneficiary" DROP COLUMN "updatedAt",
ADD COLUMN     "policy_number" VARCHAR(50) NOT NULL;
