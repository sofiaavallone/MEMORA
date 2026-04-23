import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/authMiddleware.js";

const createSchema = z.object({
  deckId: z.string().min(1),
  durationSec: z.coerce.number().int().min(0).max(24 * 60 * 60),
  cardsStudied: z.coerce.number().int().min(0),
  cardsCorrect: z.coerce.number().int().min(0),
  masteredIds: z.array(z.string()).optional(),
});

export class StudySessionController {
  create = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    }
    const { deckId, durationSec, cardsStudied, cardsCorrect, masteredIds } = parsed.data;

    if (cardsCorrect > cardsStudied) {
      return res.status(400).json({ error: "cardsCorrect não pode exceder cardsStudied." });
    }

    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId }, select: { id: true } });
    if (!deck) {
      return res.status(404).json({ error: "Deck não encontrado." });
    }

    const session = await prisma.studySession.create({
      data: { userId, deckId, durationSec, cardsStudied, cardsCorrect },
    });

    if (masteredIds && masteredIds.length > 0) {
      await prisma.flashcard.updateMany({
        where: { id: { in: masteredIds }, deckId },
        data: { mastered: true },
      });
    }

    return res.status(201).json({
      session: {
        id: session.id,
        deckId: session.deckId,
        startedAt: session.startedAt.toISOString(),
        durationSec: session.durationSec,
        cardsStudied: session.cardsStudied,
        cardsCorrect: session.cardsCorrect,
      },
    });
  };
}
