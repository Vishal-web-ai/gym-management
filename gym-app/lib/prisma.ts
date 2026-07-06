import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Database not configured. Set DATABASE_URL in .env then run: npx prisma db push",
  );
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
export const prisma = globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient({ adapter } as any));

prisma.$connect();
