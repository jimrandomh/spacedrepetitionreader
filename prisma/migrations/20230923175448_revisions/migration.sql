-- Create card-revisions table
CREATE TABLE "CardRevision" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,

    CONSTRAINT "CardRevision_pkey" PRIMARY KEY ("id")
);

-- Create a card-revision for each existing Card
INSERT INTO "CardRevision"("id", "cardId", "front", "back", "userId")
SELECT
  "Card".id AS "id",
  "Card".id AS "cardId",
  "Card".front AS "front",
  "Card".back as "back",
  "Deck"."authorId" as "userId"
FROM "Card", "Deck"
WHERE "Card"."deckId"="Deck"."id";

-- Add the activeRevisionId column to cards
ALTER TABLE "Card"
ADD COLUMN "activeRevisionId" TEXT;

-- Populate the activeRevisionId column with the IDs of the newly created revisions
UPDATE "Card"
SET "activeRevisionId" = (
    SELECT id
    FROM "CardRevision"
    WHERE "Card".id = "CardRevision"."cardId"
);

-- AlterTable
ALTER TABLE "Card"
DROP COLUMN "back",
DROP COLUMN "front";

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_activeRevisionId_fkey" FOREIGN KEY ("activeRevisionId") REFERENCES "CardRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardRevision" ADD CONSTRAINT "CardRevision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardRevision" ADD CONSTRAINT "CardRevision_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
