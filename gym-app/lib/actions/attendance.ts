"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
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

export async function getMembersForAttendance() {
  const userId = await getUserId();
  return prisma().member.findMany({
    where: { userId },
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      phone: true,
      status: true,
    },
  });
}

export async function checkIn(memberId: string) {
  const userId = await getUserId();
  const member = await prisma().member.findUnique({
    where: { id: memberId, userId },
  });
  if (!member) throw new Error("Member not found");

  if (member.status === "Frozen") throw new Error("Membership is frozen");
  if (member.status === "Expired") throw new Error("Membership has expired");
  if (member.status === "Overdue" && member.endDate) {
    const graceEnd = new Date(member.endDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    if (new Date() > graceEnd) throw new Error("Membership has expired");
  }

  const record = await prisma().attendance.create({
    data: { userId, memberId, memberName: member.firstName },
  });

  logActivity("attendance.checkin", JSON.stringify({ memberId, name: member.firstName }));
  revalidatePath("/attendance");
  return record;
}

export async function getTodayCheckIns() {
  const userId = await getUserId();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  return prisma().attendance.findMany({
    where: {
      userId,
      checkInTime: { gte: startOfDay, lt: endOfDay },
    },
    orderBy: { checkInTime: "desc" },
    include: {
      member: { select: { firstName: true } },
    },
  });
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

export async function getGymConfigForAttendance() {
  const userId = await getUserId();
  const config = await prisma().gymConfig.findUnique({
    where: { userId },
  });
  return {
    userId,
    gymName: config?.gymName ?? "Iron Forge Gym",
    gymLat: config?.gymLat,
    gymLng: config?.gymLng,
    gymRadius: config?.gymRadius,
  };
}

export async function getGymConfigPublic(gymId: string) {
  return prisma().gymConfig.findUnique({
    where: { userId: gymId },
    select: {
      gymName: true,
      gymLat: true,
      gymLng: true,
      gymRadius: true,
    },
  });
}

export async function checkInByPhone(
  phone: string,
  gymId: string,
  memberLat?: number,
  memberLng?: number
) {
  // Find member in this specific gym
  const member = await prisma().member.findFirst({
    where: {
      phone: phone.trim(),
      userId: gymId,
    },
  });

  if (!member) {
    throw new Error("Member not found with this phone number");
  }

  if (member.status === "Frozen") {
    throw new Error("Membership is frozen");
  }
  if (member.status === "Expired") {
    throw new Error("Membership has expired");
  }
  if (member.status === "Overdue" && member.endDate) {
    const graceEnd = new Date(member.endDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    if (new Date() > graceEnd) throw new Error("Membership has expired");
  }

  // Check Location if configured
  const config = await prisma().gymConfig.findUnique({
    where: { userId: gymId },
  });

  if (config && config.gymLat !== null && config.gymLng !== null && config.gymRadius !== null) {
    if (memberLat === undefined || memberLng === undefined) {
      throw new Error("GPS location is required to verify you are at the gym");
    }

    const distance = getDistance(config.gymLat, config.gymLng, memberLat, memberLng);
    // Allow a 15-meter grace buffer for GPS inaccuracy
    const maxRadius = config.gymRadius + 15;
    if (distance > maxRadius) {
      throw new Error(
        `You must be at the gym to check in. (Distance: ${Math.round(
          distance,
        )}m, allowed: ${Math.round(maxRadius)}m)`,
      );
    }
  }

  const record = await prisma().attendance.create({
    data: {
      userId: gymId,
      memberId: member.id,
      memberName: member.firstName,
    },
  });

  logActivity(
    "attendance.public_checkin",
    JSON.stringify({ memberId: member.id, name: member.firstName }),
  );
  revalidatePath("/attendance");

  return {
    success: true,
    memberName: member.firstName,
    status: member.status,
    checkInTime: record.checkInTime,
  };
}

