-- CreateTable
CREATE TABLE "ClaimFile" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "policy_holder_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "policy_number" TEXT,

    CONSTRAINT "ClaimFile_pkey" PRIMARY KEY ("id")
);
