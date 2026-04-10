import type { Request, Response } from "express";
import { z } from "zod";

import {
  FileProcessingTimeoutError,
  GeminiServiceError,
  PromptValidationError,
} from "../errors/index.js";
import { FlashcardService } from "../services/FlashcardService.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/authMiddleware.js";

const DECK_COLORS = ["purple", "indigo", "pink", "cyan"] as const;
type DeckColor = (typeof DECK_COLORS)[number];

const generateSchema = z.object({
  topic: z.string().trim().min(3, "Informe um tópico com ao menos 3 caracteres."),
  quantity: z.coerce.number().int().min(5).max(50),
  pdfUrl: z.string().trim().url("Forneça uma URL válida de PDF.").optional(),
  sourceName: z.string().trim().max(255).optional(),
});

function pickColor(): DeckColor {
  const idx = Math.floor(Math.random() * DECK_COLORS.length);
  return DECK_COLORS[idx] ?? "purple";
}

function serializeDeck(deck: {
  id: string;
  title: string;
  topic: string;
  color: string;
  sourceName: string | null;
  createdAt: Date;
  updatedAt: Date;
  flashcards?: { id: string; question: string; answer: string; mastered: boolean; order: number }[];
  _count?: { flashcards: number; sessions: number };
}) {
  const totalCards = deck._count?.flashcards ?? deck.flashcards?.length ?? 0;
  return {
    id: deck.id,
    title: deck.title,
    topic: deck.topic,
    color: deck.color,
    sourceName: deck.sourceName,
    cardCount: totalCards,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
    flashcards: deck.flashcards?.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      mastered: f.mastered,
      order: f.order,
    })),
  };
}

export class DeckController {
  constructor(private readonly flashcardService: FlashcardService) {}

  list = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;
    const decks = await prisma.deck.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { flashcards: true, sessions: true } },
      },
    });

    const ids = decks.map((d) => d.id);
    const sessions = ids.length
      ? await prisma.studySession.groupBy({
          by: ["deckId"],
          where: { deckId: { in: ids } },
          _sum: { cardsStudied: true, cardsCorrect: true },
        })
      : [];
    const sessionMap = new Map(sessions.map((s) => [s.deckId, s]));

    return res.status(200).json({
      decks: decks.map((d) => {
        const agg = sessionMap.get(d.id);
        const studied = agg?._sum.cardsStudied ?? 0;
        const correct = agg?._sum.cardsCorrect ?? 0;
        return {
          ...serializeDeck(d),
          studiedCount: studied,
          accuracy: studied > 0 ? correct / studied : 0,
        };
      }),
    });
  };

  get = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;
    const id = String(req.params.id ?? "");
    if (!id) return res.status(400).json({ error: "ID do deck ausente." });

    const deck = await prisma.deck.findFirst({
      where: { id, userId },
      include: {
        flashcards: { orderBy: { order: "asc" } },
        _count: { select: { flashcards: true, sessions: true } },
      },
    });

    if (!deck) {
      return res.status(404).json({ error: "Deck não encontrado." });
    }

    const agg = await prisma.studySession.aggregate({
      where: { deckId: deck.id },
      _sum: { cardsStudied: true, cardsCorrect: true, durationSec: true },
    });
    const studied = agg._sum.cardsStudied ?? 0;
    const correct = agg._sum.cardsCorrect ?? 0;

    return res.status(200).json({
      deck: {
        ...serializeDeck(deck),
        studiedCount: studied,
        accuracy: studied > 0 ? correct / studied : 0,
        totalDurationSec: agg._sum.durationSec ?? 0,
      },
    });
  };

  remove = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;
    const id = String(req.params.id ?? "");
    if (!id) return res.status(400).json({ error: "ID do deck ausente." });

    const deck = await prisma.deck.findFirst({ where: { id, userId }, select: { id: true } });
    if (!deck) {
      return res.status(404).json({ error: "Deck não encontrado." });
    }

    await prisma.deck.delete({ where: { id: deck.id } });
    return res.status(204).send();
  };

  generate = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    }

    const { topic, quantity, pdfUrl, sourceName } = parsed.data;

    try {
      const flashcards = await this.flashcardService.generate(
        pdfUrl ? { topic, quantity, pdfUrl } : { topic, quantity }
      );

      const deck = await prisma.deck.create({
        data: {
          userId,
          title: topic,
          topic,
          color: pickColor(),
          sourceName: sourceName ?? null,
          flashcards: {
            create: flashcards.map((f, idx) => ({
              question: f.pergunta,
              answer: f.resposta,
              order: idx,
            })),
          },
        },
        include: {
          flashcards: { orderBy: { order: "asc" } },
          _count: { select: { flashcards: true, sessions: true } },
        },
      });

      return res.status(201).json({
        deck: {
          ...serializeDeck(deck),
          studiedCount: 0,
          accuracy: 0,
        },
      });
    } catch (error) {
      console.error("[DeckController.generate]", error);

      if (error instanceof PromptValidationError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof FileProcessingTimeoutError) {
        return res.status(504).json({ error: "O processamento do conteúdo excedeu o tempo limite." });
      }
      if (error instanceof GeminiServiceError) {
        return res.status(502).json({ error: "Falha na comunicação com o serviço de IA." });
      }
      return res.status(500).json({ error: "Erro ao gerar flashcards. Tente novamente." });
    }
  };
}
