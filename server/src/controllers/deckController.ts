import type { Request, Response } from 'express';
import { DeckService } from '../services/deckservice.js';

const deckService = new DeckService();

export class DeckController {
  public async listar(req: Request, res: Response): Promise<void> {
    const userId = req.params['userId'] as string;

    if (!userId) {
      res.status(400).json({ erro: 'ID do usuário não fornecido.' });
      return;
    }

    try {
      const decks = await deckService.listarDecksDoUsuario(userId);
      res.status(200).json(decks);
    } catch (error) {
      console.error('[DeckController] Erro ao listar decks:', error);
      res.status(500).json({ erro: 'Falha interna no servidor.' });
    }
  }
}