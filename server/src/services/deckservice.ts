import { PrismaClient } from '@prisma/client';

// ✅ Instância única do Prisma (padrão Singleton para evitar múltiplas conexões)
const prisma = new PrismaClient();

// ✅ Tipo explícito para o retorno do Prisma (corrige o erro de 'any' implícito)
interface DeckComContagem {
  id: string;
  titulo: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { flashcards: number };
}

// ✅ Tipo de retorno formatado
interface DeckFormatado {
  id: string;
  titulo: string;
  criadoEm: Date;
  quantidadeFlashcards: number;
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
}