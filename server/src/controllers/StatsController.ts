import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/authMiddleware.js";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);
}

export class StatsController {
  overview = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;

    const [deckCount, flashcardCount, sessionAgg, sessions] = await Promise.all([
      prisma.deck.count({ where: { userId } }),
      prisma.flashcard.count({ where: { deck: { userId } } }),
      prisma.studySession.aggregate({
        where: { userId },
        _sum: { cardsStudied: true, cardsCorrect: true, durationSec: true },
      }),
      prisma.studySession.findMany({
        where: { userId },
        select: { startedAt: true, cardsStudied: true, cardsCorrect: true },
        orderBy: { startedAt: "desc" },
        take: 90,
      }),
    ]);

    const cardsStudied = sessionAgg._sum.cardsStudied ?? 0;
    const cardsCorrect = sessionAgg._sum.cardsCorrect ?? 0;
    const totalDurationSec = sessionAgg._sum.durationSec ?? 0;
    const accuracy = cardsStudied > 0 ? cardsCorrect / cardsStudied : 0;

    // Last 7 days sparkline (cards studied per day)
    const today = startOfDay(new Date());
    const sparkline = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - i));
      const dayKey = day.getTime();
      const total = sessions
        .filter((s) => startOfDay(s.startedAt).getTime() === dayKey)
        .reduce((acc, s) => acc + s.cardsStudied, 0);
      return { date: day.toISOString(), value: total };
    });

    return res.status(200).json({
      stats: {
        deckCount,
        flashcardCount,
        cardsStudied,
        cardsCorrect,
        accuracy,
        totalDurationSec,
        sparkline,
      },
    });
  };

  streak = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;

    const sessions = await prisma.studySession.findMany({
      where: { userId },
      select: { startedAt: true },
      orderBy: { startedAt: "desc" },
      take: 365,
    });

    const uniqueDays = new Set(sessions.map((s) => startOfDay(s.startedAt).getTime()));
    const sortedDays = [...uniqueDays].sort((a, b) => b - a);

    const today = startOfDay(new Date()).getTime();
    const yesterday = today - 86_400_000;

    let current = 0;
    const mostRecent = sortedDays[0];
    if (mostRecent !== undefined && (mostRecent === today || mostRecent === yesterday)) {
      current = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prev = sortedDays[i - 1];
        const curr = sortedDays[i];
        if (prev !== undefined && curr !== undefined && prev - curr === 86_400_000) {
          current += 1;
        } else {
          break;
        }
      }
    }

    // Longest streak
    let longest = 0;
    let run = 0;
    for (let i = 0; i < sortedDays.length; i++) {
      const prev = sortedDays[i - 1];
      const curr = sortedDays[i];
      if (i === 0 || (prev !== undefined && curr !== undefined && prev - curr === 86_400_000)) {
        run += 1;
      } else {
        run = 1;
      }
      if (run > longest) longest = run;
    }

    // Last 7 days activity
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const day = startOfDay(new Date());
      day.setDate(day.getDate() - (6 - i));
      return {
        date: day.toISOString(),
        active: uniqueDays.has(day.getTime()),
      };
    });

    const firstSession = sessions[0];
    const lastStudiedAt = firstSession?.startedAt.toISOString() ?? null;

    return res.status(200).json({
      streak: {
        current,
        longest,
        lastStudiedAt,
        last7,
        daysSinceLast: firstSession ? daysBetween(new Date(), firstSession.startedAt) : null,
      },
    });
  };
}
