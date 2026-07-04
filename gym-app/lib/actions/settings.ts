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

async function getUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function getGymConfig() {
  const userId = await getUserId();
  return prisma().gymConfig.findUnique({ where: { userId } });
}

export async function updateGymName(gymName: string) {
  await requireAdmin();
  const userId = await getUserId();
  await prisma().gymConfig.upsert({
    where: { userId },
    update: { gymName },
    create: { userId, gymName },
  });
  logActivity("settings.gym_name.updated", JSON.stringify({ gymName }));
  revalidatePath("/settings");
}

export async function updateOwnerName(ownerName: string) {
  await requireAdmin();
  const userId = await getUserId();
  await prisma().gymConfig.upsert({
    where: { userId },
    update: { ownerName },
    create: { userId, ownerName },
  });
  logActivity("settings.owner_name.updated", JSON.stringify({ ownerName }));
  revalidatePath("/settings");
}

export async function updateGymLocation(lat: number, lng: number, radius: number) {
  await requireAdmin();
  const userId = await getUserId();
  await prisma().gymConfig.upsert({
    where: { userId },
    update: { gymLat: lat, gymLng: lng, gymRadius: radius },
    create: { userId, gymLat: lat, gymLng: lng, gymRadius: radius },
  });
  logActivity("settings.gym_location.updated", JSON.stringify({ lat, lng, radius }));
  revalidatePath("/settings");
}
