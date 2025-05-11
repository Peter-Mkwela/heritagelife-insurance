-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" SERIAL NOT NULL,
    "policyHolderId" INTEGER NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "relationship" VARCHAR(50) NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_policyHolderId_fkey" FOREIGN KEY ("policyHolderId") REFERENCES "PolicyHolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
