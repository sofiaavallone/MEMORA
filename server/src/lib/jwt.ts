import jwt from "jsonwebtoken";
import { env } from "./env.js";

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload & JwtPayload;
    if (!decoded.sub || !decoded.email) return null;
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}
