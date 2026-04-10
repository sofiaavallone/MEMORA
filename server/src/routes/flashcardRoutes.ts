import { Router } from "express";

import { FlashcardController } from "../controllers/FlashcardController.js";
import { FlashcardService } from "../services/FlashcardService.js";

const createFlashcardRoutes = (): Router => {
  const flashcardRoutes = Router();
  const flashcardService = new FlashcardService();
  const flashcardController = new FlashcardController(flashcardService);

  flashcardRoutes.post("/generate", flashcardController.generate);

  return flashcardRoutes;
};

export { createFlashcardRoutes };
