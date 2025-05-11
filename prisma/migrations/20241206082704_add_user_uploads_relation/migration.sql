-- CreateTable
CREATE TABLE "UserUploads" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "policy_holder_id" INTEGER NOT NULL,

    CONSTRAINT "UserUploads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserUploads" ADD CONSTRAINT "UserUploads_policy_holder_id_fkey" FOREIGN KEY ("policy_holder_id") REFERENCES "PolicyHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
