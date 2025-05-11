-- CreateTable
CREATE TABLE "OcrApplication" (
    "id" SERIAL NOT NULL,
    "applicationNo" VARCHAR(50) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "medicalCondition" VARCHAR(255) NOT NULL,
    "preferredPremium" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filePath" TEXT NOT NULL,

    CONSTRAINT "OcrApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OcrApplication_applicationNo_key" ON "OcrApplication"("applicationNo");
