-- AddForeignKey
ALTER TABLE "ClaimFile" ADD CONSTRAINT "ClaimFile_policy_holder_id_fkey" FOREIGN KEY ("policy_holder_id") REFERENCES "PolicyHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
