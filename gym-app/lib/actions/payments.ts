"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getAllPayments(page = 1, month?: number, year?: number) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;

  const take = 30;
  const where: Record<string, unknown> = { userId: ownerId };

  if (month !== undefined && year !== undefined) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    where.createdAt = { gte: start, lt: end };
  }

  const [payments, total, amountResult] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
      include: { member: { select: { firstName: true, phone: true } } },
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: { ...where, status: "Paid" },
      _sum: { amount: true },
    }),
  ]);

  return {
    payments,
    total,
    hasMore: (page * take) < total,
    totalAmount: amountResult._sum.amount ?? 0,
  };
}
