/*
  Warnings:

  - You are about to drop the column `titulo` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `acertos` on the `Flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `intervalo` on the `Flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `pergunta` on the `Flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `proxRevisao` on the `Flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `resposta` on the `Flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Deck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `Deck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer` to the `Flashcard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `Flashcard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('PASSWORD', 'GOOGLE');

-- AlterTable
ALTER TABLE "Deck" DROP COLUMN "titulo",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'purple',
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "topic" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Flashcard" DROP COLUMN "acertos",
DROP COLUMN "intervalo",
DROP COLUMN "pergunta",
DROP COLUMN "proxRevisao",
DROP COLUMN "resposta",
DROP COLUMN "updatedAt",
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "mastered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "question" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "nome",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'PASSWORD',
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "cardsStudied" INTEGER NOT NULL DEFAULT 0,
    "cardsCorrect" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudySession_userId_idx" ON "StudySession"("userId");

-- CreateIndex
CREATE INDEX "StudySession_deckId_idx" ON "StudySession"("deckId");

-- CreateIndex
CREATE INDEX "StudySession_startedAt_idx" ON "StudySession"("startedAt");

-- CreateIndex
CREATE INDEX "Deck_userId_idx" ON "Deck"("userId");

-- CreateIndex
CREATE INDEX "Flashcard_deckId_idx" ON "Flashcard"("deckId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
