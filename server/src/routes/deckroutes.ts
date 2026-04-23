import { Router, type Router as ExpressRouter } from 'express';
import { DeckController } from '../controllers/deckController.js';

const router: ExpressRouter = Router();
const deckController = new DeckController();

router.get('/user/:userId', (req, res) => deckController.listar(req, res));

router.get('/:id', (req, res) => deckController.obterDetalhes(req, res));

export default router;