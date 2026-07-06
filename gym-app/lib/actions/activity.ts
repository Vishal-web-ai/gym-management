"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function logActivity(action: string, details?: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const ownerId = user.gymOwnerId;
  try {
    await prisma.activityLog.create({ data: { userId: ownerId, action, details } });
  } catch {}
}

export async function getActivityLogs(page = 1, actionFilter?: string) {
  const user = await getCurrentUser();
  if (!user) return { logs: [], total: 0 };
  const ownerId = user.gymOwnerId;

  const take = 30;
  const where: any = { userId: ownerId };
  if (actionFilter) where.action = actionFilter;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, total };
}
