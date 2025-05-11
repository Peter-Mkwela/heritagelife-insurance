/*
  Warnings:

  - A unique constraint covering the columns `[ocr_application_id]` on the table `UserUploads` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserUploads" ADD COLUMN     "ocr_application_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "UserUploads_ocr_application_id_key" ON "UserUploads"("ocr_application_id");
