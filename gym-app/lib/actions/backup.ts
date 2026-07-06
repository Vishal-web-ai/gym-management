"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function exportBackup() {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;

  const [members, payments, attendance, expenses, plans, config, activityLogs] = await Promise.all([
    prisma.member.findMany({ where: { userId: ownerId } }),
    prisma.payment.findMany({ where: { userId: ownerId } }),
    prisma.attendance.findMany({ where: { userId: ownerId } }),
    prisma.expense.findMany({ where: { userId: ownerId } }),
    prisma.plan.findMany({ where: { userId: ownerId } }),
    prisma.gymConfig.findUnique({ where: { userId: ownerId } }),
    prisma.activityLog.findMany({ where: { userId: ownerId } }),
  ]);

  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { members, payments, attendance, expenses, plans, config, activityLogs },
  }, null, 2);
}

export async function importBackup(formData: FormData) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const text = await file.text();
  let backup: any;
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file");
  }

  if (!backup.data) throw new Error("Invalid backup format");

  const { members, payments, attendance, expenses, plans, config } = backup.data;

  let imported = { members: 0, payments: 0, attendance: 0, expenses: 0, plans: 0 };

  if (plans?.length) {
    await prisma.$transaction(
      plans.map((plan: any) =>
        prisma.plan.upsert({
          where: { id: plan.id },
          update: { name: plan.name, price: plan.price, durationDays: plan.durationDays },
          create: { id: plan.id, userId: ownerId, name: plan.name, price: plan.price, durationDays: plan.durationDays },
        })
      )
    );
    imported.plans = plans.length;
  }

  if (members?.length) {
    await prisma.$transaction(
      members.map((m: any) =>
        prisma.member.upsert({
          where: { id: m.id },
          update: {
            firstName: m.firstName, phone: m.phone,
            address: m.address, gender: m.gender,
            status: m.status, endDate: m.endDate ? new Date(m.endDate) : null,
            planId: m.planId, frozenAt: m.frozenAt ? new Date(m.frozenAt) : null,
          },
          create: {
            id: m.id, userId: ownerId, firstName: m.firstName,
            phone: m.phone, address: m.address, gender: m.gender,
            status: m.status, endDate: m.endDate ? new Date(m.endDate) : null,
            planId: m.planId, frozenAt: m.frozenAt ? new Date(m.frozenAt) : null,
            createdAt: new Date(m.createdAt),
          },
        })
      )
    );
    imported.members = members.length;
  }

  await Promise.all([
    payments?.length
      ? prisma.$transaction(
          payments.map((p: any) =>
            prisma.payment.upsert({
              where: { id: p.id },
              update: { amount: p.amount, mode: p.mode, status: p.status },
              create: {
                id: p.id, userId: ownerId, memberId: p.memberId,
                amount: p.amount, mode: p.mode, status: p.status,
                createdAt: new Date(p.createdAt),
              },
            })
          )
        )
      : Promise.resolve(),
    attendance?.length
      ? prisma.$transaction(
          attendance.map((a: any) =>
            prisma.attendance.upsert({
              where: { id: a.id },
              update: { checkInTime: new Date(a.checkInTime) },
              create: {
                id: a.id, userId: ownerId, memberId: a.memberId,
                checkInTime: new Date(a.checkInTime),
              },
            })
          )
        )
      : Promise.resolve(),
    expenses?.length
      ? prisma.$transaction(
          expenses.map((e: any) =>
            prisma.expense.upsert({
              where: { id: e.id },
              update: { title: e.title, amount: e.amount, category: e.category, date: new Date(e.date) },
              create: {
                id: e.id, userId: ownerId, title: e.title, amount: e.amount,
                category: e.category, date: new Date(e.date),
              },
            })
          )
        )
      : Promise.resolve(),
  ]);

  if (config) {
    await prisma.gymConfig.upsert({
      where: { userId: ownerId },
      update: { gymName: config.gymName, ownerName: config.ownerName },
      create: { userId: ownerId, gymName: config.gymName, ownerName: config.ownerName },
    });
  }

  return imported;
}
