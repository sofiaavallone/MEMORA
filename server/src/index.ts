import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import { env } from "./lib/env.js";
import { createAuthRoutes } from "./routes/authRoutes.js";
import { createDeckRoutes } from "./routes/deckRoutes.js";
import { createFlashcardRoutes } from "./routes/flashcardRoutes.js";
import { createStatsRoutes } from "./routes/statsRoutes.js"; 
import { createStudySessionRoutes } from "./routes/studySessionRoutes.js";

const app = express();

const allowedOrigins = env.corsOrigin.split(",").map((o) => o.trim()).filter(Boolean);

app.disable("x-powered-by");
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`Origem não permitida: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", createAuthRoutes());
app.use("/api/decks", createDeckRoutes);
app.use("/api/flashcards", createFlashcardRoutes());
app.use("/api/stats", createStatsRoutes());
app.use("/api/sessions", createStudySessionRoutes());

app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "O corpo da requisição JSON é inválido." });
  }

  if (res.headersSent) {
    return next(error);
  }

  console.error("Erro não tratado na aplicação:", error);
  return res.status(500).json({ error: "Erro interno do servidor." });
});

app.listen(env.port, () => {
  console.log(`[MEMORA API] Servidor iniciado na porta ${env.port} (env=${env.nodeEnv}).`);
});
