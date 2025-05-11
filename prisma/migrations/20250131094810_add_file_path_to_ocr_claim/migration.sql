/*
  Warnings:

  - Added the required column `filePath` to the `OcrClaim` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OcrClaim" ADD COLUMN     "filePath" TEXT NOT NULL;
