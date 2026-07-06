"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/actions/activity";

export async function getPlans(uid?: string) {
  const user = await requireAdmin();
  const resolvedUserId = uid ?? user.gymOwnerId;

  return prisma.plan.findMany({
    where: { userId: resolvedUserId },
    orderBy: { price: "asc" },
  });
}

export async function createPlan(name: string, price: number, durationDays: number) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;

  const plan = await prisma.plan.create({
    data: { userId: ownerId, name, price, durationDays },
  });

  logActivity("plan.created", JSON.stringify({ id: plan.id, name }));
  revalidatePath("/settings");
  return plan;
}

export async function updatePlan(id: string, name: string, price: number, durationDays: number) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;

  await prisma.plan.update({
    where: { id, userId: ownerId },
    data: { name, price, durationDays },
  });

  logActivity("plan.updated", JSON.stringify({ id, name }));
  revalidatePath("/settings");
}

export async function deletePlan(id: string) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;

  await prisma.plan.delete({ where: { id, userId: ownerId } });

  logActivity("plan.deleted", JSON.stringify({ id }));
  revalidatePath("/settings");
}
