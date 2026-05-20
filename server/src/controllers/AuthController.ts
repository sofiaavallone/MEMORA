import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";

import { env, isGoogleOAuthConfigured } from "../lib/env.js";
import { signJwt } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/authMiddleware.js";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter ao menos 2 caracteres.")
    .max(100, "Nome deve ter no máximo 100 caracteres.")
    .regex(/\S/, "Nome não pode conter apenas espaços."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um email válido.")
    .max(255, "Email deve ter no máximo 255 caracteres."),
  password: z
    .string()
    .min(6, "Senha deve ter ao menos 6 caracteres.")
    .max(72, "Senha deve ter no máximo 72 caracteres."),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um email válido.")
    .max(255, "Email deve ter no máximo 255 caracteres."),
  password: z.string().min(1, "Senha é obrigatória."),
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1, "idToken é obrigatório."),
});

const googleClient: OAuth2Client | null = env.googleClientId
  ? new OAuth2Client(env.googleClientId)
  : null;

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

export class AuthController {
  register = async (req: Request, res: Response): Promise<Response> => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const erros = parsed.error.issues.map((i) => i.message);
      return res.status(400).json({ error: erros[0] ?? "Dados inválidos.", erros });
    }

    const { name, email, password } = parsed.data;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: "Este email já está em uso." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, passwordHash, provider: "PASSWORD" },
        select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
      });

      const token = signJwt({ sub: user.id, email: user.email });
      return res.status(201).json({ user: publicUser(user), token });
    } catch (error) {
      console.error("[AuthController.register]", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const erros = parsed.error.issues.map((i) => i.message);
      return res.status(400).json({ error: erros[0] ?? "Dados inválidos.", erros });
    }

    const { email, password } = parsed.data;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      // Mensagem genérica para não revelar se o email existe
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Email ou senha incorretos." });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Email ou senha incorretos." });
      }

      const token = signJwt({ sub: user.id, email: user.email });
      return res.status(200).json({
        user: publicUser({
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        }),
        token,
      });
    } catch (error) {
      console.error("[AuthController.login]", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  };

  google = async (req: Request, res: Response): Promise<Response> => {
    if (!googleClient || !env.googleClientId) {
      return res.status(501).json({
        error: "Login com Google não está configurado. Defina GOOGLE_CLIENT_ID no .env.",
      });
    }

    const parsed = googleAuthSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Token do Google ausente ou inválido." });
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: parsed.data.idToken,
        audience: env.googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        return res.status(401).json({ error: "Token do Google inválido." });
      }

      const email = payload.email.toLowerCase();
      const name: string =
        payload.name ?? payload.given_name ?? email.split("@")[0] ?? email;
      const avatarUrl = payload.picture ?? null;
      const googleId = payload.sub;

      const user = await prisma.user.upsert({
        where: { email },
        update: { googleId, avatarUrl, name },
        create: { email, name, avatarUrl, googleId, provider: "GOOGLE" },
        select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
      });

      const token = signJwt({ sub: user.id, email: user.email });
      return res.status(200).json({ user: publicUser(user), token });
    } catch (error) {
      console.error("[AuthController.google]", error);
      return res.status(401).json({ error: "Falha ao autenticar com Google." });
    }
  };

  me = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      return res.status(200).json({ user: publicUser(user) });
    } catch (error) {
      console.error("[AuthController.me]", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  };

  logout = async (_req: Request, res: Response): Promise<Response> => {
    return res.status(204).send();
  };

  config = async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      googleOAuth: isGoogleOAuthConfigured(),
      googleClientId: env.googleClientId ?? null,
    });
  };
}