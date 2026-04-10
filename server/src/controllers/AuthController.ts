import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";

import { env, isGoogleOAuthConfigured } from "../lib/env.js";
import { signJwt } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/authMiddleware.js";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.string().trim().toLowerCase().email("Email inválido."),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido."),
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
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Este email já está em uso." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, provider: "PASSWORD" },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = signJwt({ sub: user.id, email: user.email });
    return res.status(201).json({ user: publicUser(user), token });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = signJwt({ sub: user.id, email: user.email });
    return res.status(200).json({ user: publicUser(user), token });
  };

  google = async (req: Request, res: Response): Promise<Response> => {
    if (!googleClient || !env.googleClientId) {
      return res.status(501).json({
        error:
          "Login com Google não está configurado no servidor. Defina GOOGLE_CLIENT_ID no .env do backend.",
      });
    }

    const parsed = googleAuthSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "idToken ausente." });
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
      const name = payload.name ?? payload.given_name ?? email.split("@")[0];
      const avatarUrl = payload.picture ?? null;
      const googleId = payload.sub;

      const user = await prisma.user.upsert({
        where: { email },
        update: { googleId, avatarUrl, name },
        create: {
          email,
          name,
          avatarUrl,
          googleId,
          provider: "GOOGLE",
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      const token = signJwt({ sub: user.id, email: user.email });
      return res.status(200).json({ user: publicUser(user), token });
    } catch (error) {
      console.error("[AuthController.google] Erro ao verificar token:", error);
      return res.status(401).json({ error: "Falha ao autenticar com Google." });
    }
  };

  me = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req as AuthedRequest;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    return res.status(200).json({ user: publicUser(user) });
  };

  logout = async (_req: Request, res: Response): Promise<Response> => {
    // Stateless JWT — client just drops the token.
    return res.status(204).send();
  };

  config = async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      googleOAuth: isGoogleOAuthConfigured(),
      googleClientId: env.googleClientId ?? null,
    });
  };
}
