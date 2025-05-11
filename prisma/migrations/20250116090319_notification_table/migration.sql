-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "policyHolderId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_policyHolderId_fkey" FOREIGN KEY ("policyHolderId") REFERENCES "PolicyHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
