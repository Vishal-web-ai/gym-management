"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getMonthlyTrend() {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();

  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const [allPayments, allExpenses] = await prisma.$transaction([
    prisma.payment.findMany({
      where: { userId: ownerId, status: "Paid", createdAt: { gte: startOfYear, lt: startOfNextYear } },
      select: { amount: true, createdAt: true },
    }),
    prisma.expense.findMany({
      where: { userId: ownerId, date: { gte: startOfYear, lt: startOfNextYear } },
      select: { amount: true, date: true },
    }),
  ]);

  const months: { label: string; revenue: number; expenses: number }[] = [];
  for (let m = 0; m <= currentMonth; m++) {
    const d = new Date(year, m, 1);
    const monthRevenue = allPayments
      .filter(p => p.createdAt.getMonth() === m)
      .reduce((sum, p) => sum + p.amount, 0);
    const monthExpenses = allExpenses
      .filter(e => e.date.getMonth() === m)
      .reduce((sum, e) => sum + e.amount, 0);
    months.push({
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      revenue: monthRevenue,
      expenses: monthExpenses,
    });
  }
  return months;
}

export async function getDashboardStats() {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenue, activeCount, overdueCount, expensesSum, recentPayments] =
    await prisma.$transaction([
      prisma.payment.aggregate({
        where: { userId: ownerId, status: "Paid", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.member.count({ where: { userId: ownerId, status: "Active" } }),
      prisma.member.count({ where: { userId: ownerId, status: "Overdue" } }),
      prisma.expense.aggregate({
        where: { userId: ownerId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: { userId: ownerId, status: "Paid" },
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

export async function getDashboardData() {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const startOfMonth = new Date(year, currentMonth, 1);
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const [revenue, activeCount, overdueCount, expensesSum, recentPayments, allPayments, allExpenses] =
    await prisma.$transaction([
      prisma.payment.aggregate({
        where: { userId: ownerId, status: "Paid", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.member.count({ where: { userId: ownerId, status: "Active" } }),
      prisma.member.count({ where: { userId: ownerId, status: "Overdue" } }),
      prisma.expense.aggregate({
        where: { userId: ownerId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: { userId: ownerId, status: "Paid" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { member: { select: { firstName: true } } },
      }),
      prisma.payment.findMany({
        where: { userId: ownerId, status: "Paid", createdAt: { gte: startOfYear, lt: startOfNextYear } },
        select: { amount: true, createdAt: true },
      }),
      prisma.expense.findMany({
        where: { userId: ownerId, date: { gte: startOfYear, lt: startOfNextYear } },
        select: { amount: true, date: true },
      }),
    ]);

  const months: { label: string; revenue: number; expenses: number }[] = [];
  for (let m = 0; m <= currentMonth; m++) {
    const d = new Date(year, m, 1);
    const monthRevenue = allPayments
      .filter(p => p.createdAt.getMonth() === m)
      .reduce((sum, p) => sum + p.amount, 0);
    const monthExpenses = allExpenses
      .filter(e => e.date.getMonth() === m)
      .reduce((sum, e) => sum + e.amount, 0);
    months.push({
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      revenue: monthRevenue,
      expenses: monthExpenses,
    });
  }

  return {
    stats: {
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
    },
    monthlyTrend: months,
  };
}
