-- CreateTable
CREATE TABLE "Policy" (
    "id" SERIAL NOT NULL,
    "policy_number" TEXT NOT NULL,
    "policy_holder_id" INTEGER NOT NULL,
    "agent_id" INTEGER,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policy_number_key" ON "Policy"("policy_number");

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_policy_holder_id_fkey" FOREIGN KEY ("policy_holder_id") REFERENCES "PolicyHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
