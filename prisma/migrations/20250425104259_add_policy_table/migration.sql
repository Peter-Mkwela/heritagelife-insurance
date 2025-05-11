/*
  Warnings:

  - Added the required column `email` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "fullName" VARCHAR(100) NOT NULL;
