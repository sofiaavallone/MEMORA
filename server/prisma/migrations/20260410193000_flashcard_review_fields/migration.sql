-- AlterTable
ALTER TABLE "Flashcard"
ADD COLUMN "correctCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "interval" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Flashcard_deckId_nextReviewAt_idx" ON "Flashcard"("deckId", "nextReviewAt");
