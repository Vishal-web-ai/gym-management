"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getDistance } from "@/lib/geo";
import { logActivity } from "@/lib/actions/activity";
import { getNow } from "@/lib/now";

export async function getMembersForAttendance() {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  return prisma.member.findMany({
    where: { userId: ownerId },
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
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const member = await prisma.member.findUnique({
    where: { id: memberId, userId: ownerId },
  });
  if (!member) throw new Error("Member not found");

  if (member.status === "Frozen") throw new Error("Membership is frozen");
  if (member.status === "Expired") throw new Error("Membership has expired");
  if (member.status === "Overdue" && member.endDate) {
    const graceEnd = new Date(member.endDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    if ((await getNow()) > graceEnd) throw new Error("Membership has expired");
  }

  const record = await prisma.attendance.create({
    data: { userId: ownerId, memberId, memberName: member.firstName },
  });

  logActivity("attendance.checkin", JSON.stringify({ memberId, name: member.firstName }));
  revalidatePath("/attendance");
  return record;
}

export async function getCheckInsByDate(date: string) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const d = new Date(date);
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  return prisma.attendance.findMany({
    where: {
      userId: ownerId,
      checkInTime: { gte: startOfDay, lt: endOfDay },
    },
    orderBy: { checkInTime: "desc" },
    include: {
      member: { select: { firstName: true } },
    },
  });
}

export async function getGymConfigForAttendance() {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const config = await prisma.gymConfig.findUnique({
    where: { userId: ownerId },
  });
  return {
    userId: ownerId,
    gymName: config?.gymName,
    gymLat: config?.gymLat,
    gymLng: config?.gymLng,
    gymRadius: config?.gymRadius,
  };
}

export async function getGymConfigPublic(gymId: string) {
  return prisma.gymConfig.findUnique({
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
  const [member, config] = await Promise.all([
    prisma.member.findFirst({
      where: { phone: phone.trim(), userId: gymId },
    }),
    prisma.gymConfig.findUnique({
      where: { userId: gymId },
    }),
  ]);

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
    if ((await getNow()) > graceEnd) throw new Error("Membership has expired");
  }

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

  const record = await prisma.attendance.create({
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

