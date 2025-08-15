-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kycData" JSONB,
ADD COLUMN     "kycStatus" TEXT DEFAULT 'pending';
