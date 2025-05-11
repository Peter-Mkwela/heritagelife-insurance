/*
  Warnings:

  - You are about to drop the column `senderEmail` on the `Query` table. All the data in the column will be lost.
  - Added the required column `policy_holder_id` to the `Query` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Query" DROP COLUMN "senderEmail",
ADD COLUMN     "policy_holder_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Query" ADD CONSTRAINT "Query_policy_holder_id_fkey" FOREIGN KEY ("policy_holder_id") REFERENCES "PolicyHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
