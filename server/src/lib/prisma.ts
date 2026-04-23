import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { env } from "./env.js";

// Singleton Prisma client (hot-reload friendly) via pg adapter.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.databaseUrl });
  return new PrismaClient({
    adapter,
    log: env.nodeEnv === "production" ? ["error"] : ["warn", "error"],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (env.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}
