import { Router } from "express";
import { StudySessionController } from "../controllers/StudySessionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const createStudySessionRoutes = (): Router => {
  const router = Router();
  const controller = new StudySessionController();

  router.use(requireAuth);
  router.post("/", controller.create);

  return router;
};
