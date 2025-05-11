-- CreateTable
CREATE TABLE "OcrClaim" (
    "id" SERIAL NOT NULL,
    "claimNo" VARCHAR(50) NOT NULL,
    "policyNo" VARCHAR(50) NOT NULL,
    "deceasedName" VARCHAR(100) NOT NULL,
    "deceasedLastName" VARCHAR(100) NOT NULL,
    "cause" VARCHAR(255) NOT NULL,
    "DOD" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OcrClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OcrClaim_claimNo_key" ON "OcrClaim"("claimNo");
