"use server";

import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";

let db: any;

function prisma() {
  if (!db) db = getPrisma();
  return db;
}

export async function getAllPayments(page = 1) {
  const { userId } = await auth();
  if (!userId) return { payments: [], total: 0, hasMore: false };

  const take = 30;
  const where = { userId };

  const [payments, total] = await Promise.all([
    prisma().payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
      include: { member: { select: { firstName: true } } },
    }),
    prisma().payment.count({ where }),
  ]);

  return { payments, total, hasMore: (page * take) < total };
}
