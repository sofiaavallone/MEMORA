import { Router } from "express";
import { DeckController } from "../controllers/DeckController.js";
import { FlashcardService } from "../services/FlashcardService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const createDeckRoutes = (): Router => {
  const router = Router();
  const controller = new DeckController(new FlashcardService());

  router.use(requireAuth);
  router.get("/", controller.list);
  router.post("/generate", controller.generate);
  router.get("/:id", controller.get);
  router.delete("/:id", controller.remove);

  return router;
};
