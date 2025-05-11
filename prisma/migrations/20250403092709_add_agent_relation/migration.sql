-- AlterTable
ALTER TABLE "OcrApplication" ADD COLUMN     "agent_id" INTEGER;

-- AddForeignKey
ALTER TABLE "OcrApplication" ADD CONSTRAINT "OcrApplication_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
