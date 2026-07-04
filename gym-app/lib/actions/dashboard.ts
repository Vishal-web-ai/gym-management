"use server";

import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";

let db: any;

function prisma() {
  if (!db) db = getPrisma();
  return db;
}

async function getUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function getMonthlyTrend() {
  const userId = await getUserId();
  const now = new Date();
  const months: { label: string; revenue: number; expenses: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    const [rev, exp] = await Promise.all([
      prisma().payment.aggregate({
        where: { userId, status: "Paid", createdAt: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
      prisma().expense.aggregate({
        where: { userId, date: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
    ]);
    months.push({
      label,
      revenue: rev._sum.amount ?? 0,
      expenses: exp._sum.amount ?? 0,
    });
  }
  return months;
}

export async function getDashboardStats() {
  const userId = await getUserId();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenue, activeCount, overdueCount, expensesSum, recentPayments] =
    await Promise.all([
      prisma().payment.aggregate({
        where: {
          userId,
          status: "Paid",
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma().member.count({ where: { userId, status: "Active" } }),
      prisma().member.count({ where: { userId, status: "Overdue" } }),
      prisma().expense.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma().payment.findMany({
        where: { userId, status: "Paid" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { member: { select: { firstName: true } } },
      }),
    ]);

  return {
    revenue: revenue._sum.amount ?? 0,
    activeCount,
    overdueCount,
    expenses: expensesSum._sum.amount ?? 0,
    recentPayments: recentPayments.map((p: any) => ({
      id: p.id,
      amount: p.amount,
      memberName: p.member.firstName,
      mode: p.mode,
      createdAt: p.createdAt,
    })),
  };
}
