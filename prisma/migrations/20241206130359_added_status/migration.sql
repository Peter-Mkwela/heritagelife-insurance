-- AlterTable
ALTER TABLE "UserUploads" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Pending',
ALTER COLUMN "policy_number" SET DATA TYPE TEXT;
