import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[env] Variável obrigatória ausente: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 3001,
  databaseUrl: required("DATABASE_URL"),
  geminiApiKey: required("GEMINI_API_KEY"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "30d",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  googleClientId: optional("GOOGLE_CLIENT_ID"),
} as const;

export const isGoogleOAuthConfigured = (): boolean =>
  Boolean(env.googleClientId);
