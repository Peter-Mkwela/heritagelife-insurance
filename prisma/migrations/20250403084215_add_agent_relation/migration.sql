-- AlterTable
ALTER TABLE "PolicyHolder" ADD COLUMN     "agent_id" INTEGER;

-- AddForeignKey
ALTER TABLE "PolicyHolder" ADD CONSTRAINT "PolicyHolder_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
