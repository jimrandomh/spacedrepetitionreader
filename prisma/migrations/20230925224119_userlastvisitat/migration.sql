-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastVisitAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
