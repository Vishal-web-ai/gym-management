import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = process.env.DATABASE_URL
  ? new PrismaNeon({ connectionString: process.env.DATABASE_URL })
  : undefined;

export const prisma =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = new PrismaClient(
    adapter ? { adapter } as any : {},
  ));
