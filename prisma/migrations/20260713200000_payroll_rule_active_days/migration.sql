-- AlterTable
ALTER TABLE "PayrollRule" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "activeDays" JSONB;

