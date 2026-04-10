import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import { createFlashcardRoutes } from "./routes/flashcardRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;
const flashcardRoutes = createFlashcardRoutes();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());

app.use("/api", flashcardRoutes);

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

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}.`);
});
