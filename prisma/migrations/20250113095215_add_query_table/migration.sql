-- CreateTable
CREATE TABLE "Query" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "senderEmail" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);
