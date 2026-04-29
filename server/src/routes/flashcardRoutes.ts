import { Router } from "express";

import { FlashcardController } from "../controllers/FlashcardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const createFlashcardRoutes = (): Router => {
  const router = Router();
  const controller = new FlashcardController();

  router.use(requireAuth);

  router.get("/due", controller.due);

  router.post("/:id/review", controller.review);

  return router;
};