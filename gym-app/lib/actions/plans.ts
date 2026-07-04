"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/actions/activity";

let db: any;

function prisma() {
  if (!db) db = getPrisma();
  return db;
}

export async function getPlans() {
  const { userId } = await auth();
  if (!userId) return [];

  return prisma().plan.findMany({
    where: { userId },
    orderBy: { price: "asc" },
  });
}

export async function createPlan(name: string, price: number, durationDays: number) {
  await requireAdmin();
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const plan = await prisma().plan.create({
    data: { userId, name, price, durationDays },
  });

  logActivity("plan.created", JSON.stringify({ id: plan.id, name }));
  revalidatePath("/settings");
  return plan;
}

export async function updatePlan(id: string, name: string, price: number, durationDays: number) {
  await requireAdmin();
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await prisma().plan.update({
    where: { id, userId },
    data: { name, price, durationDays },
  });

  logActivity("plan.updated", JSON.stringify({ id, name }));
  revalidatePath("/settings");
}

export async function deletePlan(id: string) {
  await requireAdmin();
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await prisma().plan.delete({ where: { id, userId } });

  logActivity("plan.deleted", JSON.stringify({ id }));
  revalidatePath("/settings");
}
