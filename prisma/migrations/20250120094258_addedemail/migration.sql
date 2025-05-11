/*
  Warnings:

  - Added the required column `email` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "email" TEXT NOT NULL;
