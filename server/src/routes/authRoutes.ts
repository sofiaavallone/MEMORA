import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const createAuthRoutes = (): Router => {
  const router = Router();
  const controller = new AuthController();

  router.get("/config", controller.config);
  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.post("/google", controller.google);
  router.get("/me", requireAuth, controller.me);
  router.post("/logout", controller.logout);

  return router;
};
