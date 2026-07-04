"use server";

import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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

export async function exportBackup() {
  await requireAdmin();
  const userId = await getUserId();

  const [members, payments, attendance, expenses, plans, config, activityLogs] = await Promise.all([
    prisma().member.findMany({ where: { userId } }),
    prisma().payment.findMany({ where: { userId } }),
    prisma().attendance.findMany({ where: { userId } }),
    prisma().expense.findMany({ where: { userId } }),
    prisma().plan.findMany({ where: { userId } }),
    prisma().gymConfig.findUnique({ where: { userId } }),
    prisma().activityLog.findMany({ where: { userId } }),
  ]);

  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { members, payments, attendance, expenses, plans, config, activityLogs },
  }, null, 2);
}

export async function importBackup(formData: FormData) {
  await requireAdmin();
  const userId = await getUserId();

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
    for (const plan of plans) {
      await prisma().plan.upsert({
        where: { id: plan.id },
        update: { name: plan.name, price: plan.price, durationDays: plan.durationDays },
        create: { id: plan.id, userId, name: plan.name, price: plan.price, durationDays: plan.durationDays },
      });
    }
    imported.plans = plans.length;
  }

  if (members?.length) {
    for (const m of members) {
      await prisma().member.upsert({
        where: { id: m.id },
        update: {
          firstName: m.firstName, phone: m.phone,
          address: m.address, gender: m.gender,
          status: m.status, endDate: m.endDate ? new Date(m.endDate) : null,
          planId: m.planId, frozenAt: m.frozenAt ? new Date(m.frozenAt) : null,
        },
        create: {
          id: m.id, userId, firstName: m.firstName,
          phone: m.phone, address: m.address, gender: m.gender,
          status: m.status, endDate: m.endDate ? new Date(m.endDate) : null,
          planId: m.planId, frozenAt: m.frozenAt ? new Date(m.frozenAt) : null,
          createdAt: new Date(m.createdAt),
        },
      });
    }
    imported.members = members.length;
  }

  if (payments?.length) {
    for (const p of payments) {
      await prisma().payment.upsert({
        where: { id: p.id },
        update: { amount: p.amount, mode: p.mode, status: p.status },
        create: {
          id: p.id, userId, memberId: p.memberId,
          amount: p.amount, mode: p.mode, status: p.status,
          createdAt: new Date(p.createdAt),
        },
      });
    }
    imported.payments = payments.length;
  }

  if (attendance?.length) {
    for (const a of attendance) {
      await prisma().attendance.upsert({
        where: { id: a.id },
        update: { checkInTime: new Date(a.checkInTime) },
        create: {
          id: a.id, userId, memberId: a.memberId,
          checkInTime: new Date(a.checkInTime),
        },
      });
    }
    imported.attendance = attendance.length;
  }

  if (expenses?.length) {
    for (const e of expenses) {
      await prisma().expense.upsert({
        where: { id: e.id },
        update: { title: e.title, amount: e.amount, category: e.category, date: new Date(e.date) },
        create: {
          id: e.id, userId, title: e.title, amount: e.amount,
          category: e.category, date: new Date(e.date),
        },
      });
    }
    imported.expenses = expenses.length;
  }

  if (config) {
    await prisma().gymConfig.upsert({
      where: { userId },
      update: { gymName: config.gymName, ownerName: config.ownerName },
      create: { userId, gymName: config.gymName, ownerName: config.ownerName },
    });
  }

  return imported;
}
