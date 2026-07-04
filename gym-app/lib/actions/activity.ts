"use server";

import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";

let db: any;

function prisma() {
  if (!db) db = getPrisma();
  return db;
}

export async function logActivity(action: string, details?: string) {
  const { userId } = await auth();
  if (!userId) return;
  try {
    await prisma().activityLog.create({ data: { userId, action, details } });
  } catch {}
}

export async function getActivityLogs(page = 1, actionFilter?: string) {
  const { userId } = await auth();
  if (!userId) return { logs: [], total: 0 };

  const take = 30;
  const where: any = { userId };
  if (actionFilter) where.action = actionFilter;

  const [logs, total] = await Promise.all([
    prisma().activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma().activityLog.count({ where }),
  ]);

  return { logs, total };
}
