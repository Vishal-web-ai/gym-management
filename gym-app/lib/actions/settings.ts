"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/actions/activity";

export async function getGymConfig(uid?: string) {
  if (uid) return prisma.gymConfig.findUnique({ where: { userId: uid } });
  const user = await getCurrentUser();
  if (!user) return null;
  return prisma.gymConfig.findUnique({ where: { userId: user.gymOwnerId } });
}

export async function updateGymName(gymName: string) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  await prisma.gymConfig.upsert({
    where: { userId: ownerId },
    update: { gymName },
    create: { userId: ownerId, gymName },
  });
  logActivity("settings.gym_name.updated", JSON.stringify({ gymName }));
  revalidatePath("/settings");
}

export async function updateOwnerName(ownerName: string) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  await prisma.gymConfig.upsert({
    where: { userId: ownerId },
    update: { ownerName },
    create: { userId: ownerId, ownerName },
  });
  logActivity("settings.owner_name.updated", JSON.stringify({ ownerName }));
  revalidatePath("/settings");
}

export async function updateGymLocation(lat: number, lng: number, radius: number) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  await prisma.gymConfig.upsert({
    where: { userId: ownerId },
    update: { gymLat: lat, gymLng: lng, gymRadius: radius },
    create: { userId: ownerId, gymLat: lat, gymLng: lng, gymRadius: radius },
  });
  logActivity("settings.gym_location.updated", JSON.stringify({ lat, lng, radius }));
  revalidatePath("/settings");
}

export async function setTestTimeOffset(offsetMs: number) {
  const user = await requireAdmin();
  if (process.env.NODE_ENV !== "development") throw new Error("Only available in development");
  await prisma.gymConfig.upsert({
    where: { userId: user.gymOwnerId },
    update: { testTimeOffset: offsetMs },
    create: { userId: user.gymOwnerId, testTimeOffset: offsetMs },
  });
  logActivity("settings.test_time.updated", JSON.stringify({ offsetMs }));
  revalidatePath("/settings");
}

export async function clearTestTimeOffset() {
  const user = await requireAdmin();
  if (process.env.NODE_ENV !== "development") throw new Error("Only available in development");
  await prisma.gymConfig.update({
    where: { userId: user.gymOwnerId },
    data: { testTimeOffset: null },
  });
  logActivity("settings.test_time.cleared");
  revalidatePath("/settings");
}
