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

/**
 * Calcula o próximo intervalo usando o algoritmo SM-2 simplificado.
 *
 * Intervalos para acertos consecutivos:
 *   1º acerto → 1 dia
 *   2º acerto → 6 dias
 *   3º+ acerto → intervalo_atual × 2.5 (arredondado)
 *
 * Em caso de erro, reseta para 1 dia e zera o contador de acertos.
 */
function calcularProximoIntervalo(
  intervaloAtual: number,
  contagemAcertos: number,
  resultado: "correct" | "incorrect"
): { proximoIntervalo: number; proximaContagemAcertos: number } {
  if (resultado === "incorrect") {
    return { proximoIntervalo: 1, proximaContagemAcertos: 0 };
  }

  let proximoIntervalo: number;
  if (contagemAcertos === 0) {
    proximoIntervalo = 1;       
  } else if (contagemAcertos === 1) {
    proximoIntervalo = 6;       
  } else {
    proximoIntervalo = Math.round(intervaloAtual * 2.5);
  }

  return {
    proximoIntervalo,
    proximaContagemAcertos: contagemAcertos + 1,
  };
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
  /**
   * Registra o resultado de uma revisão e atualiza o agendamento do card.
   * POST /api/flashcards/:id/review
   */
  review = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;
    const flashcardId = String(req.params.id ?? "");
    if (!flashcardId) {
      return res.status(400).json({ error: "ID do flashcard ausente." });
    }

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    }

    const { result, durationSec = 0 } = parsed.data;

    const outcome = await prisma.$transaction(async (tx) => {
      const flashcard = await tx.flashcard.findFirst({
        where: { id: flashcardId, deck: { userId } },
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

      if (!flashcard) return null;

      const { proximoIntervalo, proximaContagemAcertos } = calcularProximoIntervalo(
        flashcard.interval,
        flashcard.correctCount,
        result
      );

      const agora = new Date();
      const proximaRevisao =
        result === "correct"
          ? addDays(agora, proximoIntervalo)
          : agora;

      const dominado = proximaContagemAcertos >= 5;

      const [flashcardAtualizado, sessao] = await Promise.all([
        tx.flashcard.update({
          where: { id: flashcard.id },
          data: {
            mastered: dominado,
            nextReviewAt: proximaRevisao,
            interval: proximoIntervalo,
            correctCount: proximaContagemAcertos,
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

      return { flashcard: flashcardAtualizado, sessao };
    });

    if (!outcome) {
      return res.status(404).json({ error: "Flashcard não encontrado." });
    }

    return res.status(200).json({
      flashcard: serializeFlashcard(outcome.flashcard),
      session: {
        id: outcome.sessao.id,
        deckId: outcome.sessao.deckId,
        startedAt: outcome.sessao.startedAt.toISOString(),
        durationSec: outcome.sessao.durationSec,
        cardsStudied: outcome.sessao.cardsStudied,
        cardsCorrect: outcome.sessao.cardsCorrect,
      },
    });
  };

  /**
   * Retorna os flashcards com revisão pendente para hoje.
   * GET /api/flashcards/due?deckId=<opcional>
   */
  due = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;
    const deckId = typeof req.query.deckId === "string" ? req.query.deckId : undefined;

    const flashcards = await prisma.flashcard.findMany({
      where: {
        deck: { userId },
        nextReviewAt: { lte: new Date() },
        ...(deckId ? { deckId } : {}),
      },
      include: {
        deck: { select: { id: true, title: true } },
      },
      orderBy: { nextReviewAt: "asc" },
      take: 100,
    });

    return res.status(200).json({
      flashcards: flashcards.map((f) => ({
        ...serializeFlashcard(f),
        deckId: f.deck.id,
        deckTitle: f.deck.title,
      })),
      count: flashcards.length,
    });
  };
}