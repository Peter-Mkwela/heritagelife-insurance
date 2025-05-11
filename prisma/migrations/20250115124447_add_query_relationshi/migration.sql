/*
  Warnings:

  - You are about to drop the column `policy_holder_id` on the `Query` table. All the data in the column will be lost.
  - Added the required column `senderEmail` to the `Query` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Query" DROP CONSTRAINT "Query_policy_holder_id_fkey";

-- AlterTable
ALTER TABLE "Query" DROP COLUMN "policy_holder_id",
ADD COLUMN     "senderEmail" VARCHAR(255) NOT NULL;
