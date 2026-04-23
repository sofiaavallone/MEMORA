import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

export interface AuthedRequest extends Request {
  userId: string;
  userEmail: string;
}

function extractToken(req: Request): string | null {
  const header = req.header("authorization") ?? req.header("Authorization");
  if (header && header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.token;
  return cookieToken ?? null;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Autenticação necessária." });
    return;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    res.status(401).json({ error: "Token inválido ou expirado." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true },
  });

  if (!user) {
    res.status(401).json({ error: "Usuário não encontrado." });
    return;
  }

  (req as AuthedRequest).userId = user.id;
  (req as AuthedRequest).userEmail = user.email;
  next();
}
