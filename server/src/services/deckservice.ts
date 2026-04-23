import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ✅ Interfaces declaradas FORA da classe (estavam incorretamente dentro dela)
interface DeckComContagem {
  id: string;
  titulo: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { flashcards: number };
}

export interface DeckFormatado {
  id: string;
  titulo: string;
  criadoEm: Date;
  quantidadeFlashcards: number;
}

export interface FlashcardFormatado {
  id: string;
  pergunta: string;
  resposta: string;
}

export interface DeckDetalhadoFormatado {
  id: string;
  titulo: string;
  criadoEm: Date;
  flashcards: FlashcardFormatado[];
}

export class DeckService {
  /**
   * Busca todos os decks de um usuário específico,
   * incluindo a contagem exata de flashcards dentro de cada um.
   */
  public async listarDecksDoUsuario(userId: string): Promise<DeckFormatado[]> {
    const decks = await prisma.deck.findMany({
      where: { userId },
      select: {
        id: true,
        titulo: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { flashcards: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return decks.map((deck: DeckComContagem): DeckFormatado => ({
      id: deck.id,
      titulo: deck.titulo,
      criadoEm: deck.createdAt,
      quantidadeFlashcards: deck._count.flashcards,
    }));
  }

  /**
   * Busca um deck específico pelo ID, trazendo todos os seus flashcards.
   */
  public async obterDeckComFlashcards(
    deckId: string
  ): Promise<DeckDetalhadoFormatado | null> {
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        flashcards: {
          select: {
            id: true,
            pergunta: true,
            resposta: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!deck) return null;

    return {
      id: deck.id,
      titulo: deck.titulo,
      criadoEm: deck.createdAt,
      flashcards: deck.flashcards,
    };
  }
}