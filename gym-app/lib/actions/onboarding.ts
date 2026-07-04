"use server";

import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

let db: any;

function prisma() {
  if (!db) db = getPrisma();
  return db;
}

export async function checkOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) return { needsOwnerName: true, needsGymName: true, needsPlans: true };

  try {
    const [config, plans] = await Promise.all([
      prisma().gymConfig.findUnique({ where: { userId } }),
      prisma().plan.findMany({ where: { userId }, take: 1 }),
    ]);

    return {
      needsOwnerName: !config?.ownerName,
      needsGymName: !config?.gymName,
      needsPlans: plans.length === 0,
    };
  } catch {
    return { needsOwnerName: true, needsGymName: true, needsPlans: true };
  }
}

export async function saveOwnerName(ownerName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await prisma().gymConfig.upsert({
    where: { userId },
    update: { ownerName },
    create: { userId, ownerName },
  });

  revalidatePath("/onboarding");
}

export async function saveGymName(gymName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await prisma().gymConfig.upsert({
    where: { userId },
    update: { gymName },
    create: { userId, gymName },
  });

  revalidatePath("/onboarding");
}

export async function savePlan(name: string, price: number, durationMonths: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await prisma().plan.create({
    data: { name, price, durationDays: durationMonths * 30, userId },
  });

  revalidatePath("/onboarding");
}
