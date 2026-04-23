import type { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/authMiddleware.js";

const reviewSchema = z.object({
  result: z.enum(["correct", "incorrect"]),
  durationSec: z.coerce.number().int().min(0).max(24 * 60 * 60).optional(),
});

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 86_400_000);
}

function serializeFlashcard(flashcard: {
  id: string;
  question: string;
  answer: string;
  mastered: boolean;
  order: number;
  nextReviewAt: Date;
  interval: number;
  correctCount: number;
}) {
  return {
    id: flashcard.id,
    question: flashcard.question,
    answer: flashcard.answer,
    mastered: flashcard.mastered,
    order: flashcard.order,
    nextReviewAt: flashcard.nextReviewAt.toISOString(),
    interval: flashcard.interval,
    correctCount: flashcard.correctCount,
  };
}

export class FlashcardController {
  review = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;
    const flashcardId = String(req.params.id ?? "");
    if (!flashcardId) {
      return res.status(400).json({ error: "ID do flashcard ausente." });
    }

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados invÃ¡lidos." });
    }

    const { result, durationSec = 0 } = parsed.data;

    const outcome = await prisma.$transaction(async (tx) => {
      const flashcard = await tx.flashcard.findFirst({
        where: {
          id: flashcardId,
          deck: { userId },
        },
        select: {
          id: true,
          question: true,
          answer: true,
          mastered: true,
          order: true,
          nextReviewAt: true,
          interval: true,
          correctCount: true,
          deckId: true,
        },
      });

      if (!flashcard) {
        return null;
      }

      const reviewedAt = new Date();
      const nextInterval = result === "correct" ? flashcard.interval + 1 : 1;
      const nextCorrectCount = result === "correct" ? flashcard.correctCount + 1 : 0;
      const nextReviewAt =
        result === "correct" ? addDays(reviewedAt, nextInterval) : reviewedAt;
      const mastered = nextCorrectCount >= 3;

      const [updatedFlashcard, session] = await Promise.all([
        tx.flashcard.update({
          where: { id: flashcard.id },
          data: {
            mastered,
            nextReviewAt,
            interval: nextInterval,
            correctCount: nextCorrectCount,
          },
          select: {
            id: true,
            question: true,
            answer: true,
            mastered: true,
            order: true,
            nextReviewAt: true,
            interval: true,
            correctCount: true,
          },
        }),
        tx.studySession.create({
          data: {
            userId,
            deckId: flashcard.deckId,
            durationSec,
            cardsStudied: 1,
            cardsCorrect: result === "correct" ? 1 : 0,
          },
          select: {
            id: true,
            deckId: true,
            startedAt: true,
            durationSec: true,
            cardsStudied: true,
            cardsCorrect: true,
          },
        }),
      ]);

      return { flashcard: updatedFlashcard, session };
    });

    if (!outcome) {
      return res.status(404).json({ error: "Flashcard nÃ£o encontrado." });
    }

    return res.status(200).json({
      flashcard: serializeFlashcard(outcome.flashcard),
      session: {
        id: outcome.session.id,
        deckId: outcome.session.deckId,
        startedAt: outcome.session.startedAt.toISOString(),
        durationSec: outcome.session.durationSec,
        cardsStudied: outcome.session.cardsStudied,
        cardsCorrect: outcome.session.cardsCorrect,
      },
    });
  };
}
