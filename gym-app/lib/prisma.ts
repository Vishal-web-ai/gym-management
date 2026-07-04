import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma: any };

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Database not configured. Set DATABASE_URL in .env then run: npx prisma db push",
    );
  }
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const db = new (PrismaClient as any)({ adapter });
  globalForPrisma.prisma = db;
  return db;
}
