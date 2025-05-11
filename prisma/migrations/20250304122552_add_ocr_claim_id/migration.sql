/*
  Warnings:

  - A unique constraint covering the columns `[ocr_claim_id]` on the table `ClaimFile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ClaimFile" ADD COLUMN     "ocr_claim_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ClaimFile_ocr_claim_id_key" ON "ClaimFile"("ocr_claim_id");
