-- AlterTable
ALTER TABLE "User" ADD COLUMN     "feedbackDontShowAgain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "feedbackRequestLastShown" TIMESTAMP(3),
ADD COLUMN     "hasSentFeedback" BOOLEAN NOT NULL DEFAULT false;
