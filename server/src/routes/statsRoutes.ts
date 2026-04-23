import { Router } from "express";
import { StatsController } from "../controllers/StatsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const createStatsRoutes = (): Router => {
  const router = Router();
  const controller = new StatsController();

  router.use(requireAuth);
  router.get("/overview", controller.overview);
  router.get("/streak", controller.streak);

  return router;
};
