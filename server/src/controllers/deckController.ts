import type { Request, Response } from 'express';
import { DeckService } from '../services/deckservice.js';

const deckService = new DeckService();

export class DeckController {
  /**
   * Lista todos os decks de um usuário específico.
   * GET /users/:userId/decks
   */
  public async listar(req: Request, res: Response): Promise<void> {
    const userId = Array.isArray(req.params['userId'])
      ? req.params['userId'][0]
      : req.params['userId'];

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

  /**
   * Busca um deck específico com todos os seus flashcards.
   * GET /decks/:id
   */
  public async obterDetalhes(req: Request, res: Response): Promise<void> {
    const deckId = Array.isArray(req.params['id'])
      ? req.params['id'][0]
      : req.params['id'];

    if (!deckId) {
      res.status(400).json({ erro: 'ID do deck não fornecido.' });
      return;
    }

    try {
      const deck = await deckService.obterDeckComFlashcards(deckId);

      if (!deck) {
        res.status(404).json({ erro: 'Deck não encontrado.' });
        return;
      }

      res.status(200).json(deck);
    } catch (error) {
      console.error('[DeckController] Erro ao obter detalhes do deck:', error);
      res.status(500).json({ erro: 'Falha interna no servidor.' });
    }
  }
}