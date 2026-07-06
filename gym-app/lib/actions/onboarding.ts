"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function checkOnboardingStatus() {
  const user = await getCurrentUser();
  if (!user) return { needsOwnerName: true, needsGymName: true, needsPlans: true, role: null };

  try {
    const [config, plans] = await prisma.$transaction([
      prisma.gymConfig.findUnique({ where: { userId: user.gymOwnerId } }),
      prisma.plan.findMany({ where: { userId: user.gymOwnerId }, take: 1 }),
    ]);

    return {
      needsOwnerName: !config?.ownerName,
      needsGymName: !config?.gymName,
      needsPlans: plans.length === 0,
      role: user.role,
    };
  } catch {
    return { needsOwnerName: true, needsGymName: true, needsPlans: true, role: null };
  }
}

export async function saveOwnerName(ownerName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await prisma.gymConfig.upsert({
    where: { userId },
    update: { ownerName },
    create: { userId, ownerName },
  });

  await prisma.gymUser.upsert({
    where: { clerkId: userId },
    update: { role: "OWNER", gymOwnerId: userId },
    create: { clerkId: userId, role: "OWNER", gymOwnerId: userId },
  });

  revalidatePath("/onboarding");
}

export async function saveGymName(gymName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await prisma.gymConfig.upsert({
    where: { userId },
    update: { gymName },
    create: { userId, gymName },
  });

  revalidatePath("/onboarding");
}

export async function savePlan(name: string, price: number, durationMonths: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await prisma.plan.create({
    data: { name, price, durationDays: durationMonths * 30, userId },
  });

  revalidatePath("/onboarding");
}
