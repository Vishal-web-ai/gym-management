"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getDistance } from "@/lib/geo";
import { getNow, getNowMs } from "@/lib/now";

export async function findMemberByPhone(phone: string, gymUserId: string) {
  return prisma.member.findFirst({
    where: { phone, userId: gymUserId },
    select: { id: true, firstName: true, status: true, endDate: true, image: true },
  });
}

export async function getGymConfigByUserId(userId: string) {
  return prisma.gymConfig.findUnique({
    where: { userId },
    select: { gymName: true, gymLat: true, gymLng: true, gymRadius: true },
  });
}

export async function getMemberDashboard(memberId: string, gymUserId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId, userId: gymUserId },
    include: { plan: true },
  });
  if (!member) return null;

  if (member.status === "Expired") return null;
  if (member.status === "Overdue" && member.endDate) {
    const graceEnd = new Date(member.endDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    if ((await getNow()) > graceEnd) return null;
  }

  const now = await getNow();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalAttendance, todayCheckedIn, allAttendances, personalRecords] = await Promise.all([
    prisma.attendance.count({ where: { memberId } }),
    prisma.attendance.findFirst({
      where: { memberId, checkInTime: { gte: startOfToday } },
    }),
    prisma.attendance.findMany({
      where: { memberId },
      orderBy: { checkInTime: "desc" },
      take: 30,
    }),
    prisma.personalRecord.findMany({
      where: { memberId },
      orderBy: { date: "desc" },
    }),
  ]);

  return {
    member: {
      id: member.id,
      firstName: member.firstName,
      phone: member.phone,
      status: member.status,
      createdAt: member.createdAt,
      endDate: member.endDate,
      image: member.image,
      plan: member.plan,
    },
    stats: {
      totalAttendance,
      todayCheckedIn: !!todayCheckedIn,
    },
    recentAttendances: allAttendances,
    personalRecords,
  };
}

export async function getAttendanceCalendar(memberId: string, gymUserId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const records = await prisma.attendance.findMany({
    where: {
      memberId,
      userId: gymUserId,
      checkInTime: { gte: start, lte: end },
    },
    select: { checkInTime: true },
    orderBy: { checkInTime: "asc" },
  });

  return records.map((r: { checkInTime: Date }) => ({
    date: new Date(r.checkInTime).getDate(),
    day: new Date(r.checkInTime).getDay(),
  }));
}

export async function getWeeklyStreak(memberId: string, gymUserId: string, year?: number, month?: number) {
  const where: any = { memberId, userId: gymUserId };
  if (year !== undefined && month !== undefined) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    where.checkInTime = { gte: start, lte: end };
  }

  const attendances = await prisma.attendance.findMany({
    where,
    select: { checkInTime: true },
    orderBy: { checkInTime: "desc" },
  });

  if (attendances.length === 0) return { current: 0, best: 0 };

  const uniqueDays = new Set<string>();
  attendances.forEach((a: { checkInTime: Date }) => {
    const d = new Date(a.checkInTime);
    uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });

  const sortedDays = Array.from(uniqueDays)
    .map((s) => {
      const [y, m, day] = s.split("-").map(Number);
      return new Date(y, m, day);
    })
    .sort((a, b) => b.getTime() - a.getTime());

  // current = total unique days in the period
  const currentStreak = sortedDays.length;

  // best = longest consecutive streak
  let bestStreak = 0;
  let tempStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = (sortedDays[i - 1].getTime() - sortedDays[i].getTime()) / 86400000;
    if (Math.round(diff) === 1) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  return { current: currentStreak, best: bestStreak };
}

export async function getPaymentHistory(memberId: string, gymUserId: string) {
  return prisma.payment.findMany({
    where: { memberId, userId: gymUserId },
    orderBy: { createdAt: "desc" },
    select: { id: true, amount: true, mode: true, status: true, createdAt: true },
  });
}

export async function recordPR(memberId: string, gymUserId: string, exercise: string, weight: number, reps: number) {
  // ponytail: verify ownership before create (PR table has no userId)
  const m = await prisma.member.findUnique({ where: { id: memberId, userId: gymUserId }, select: { id: true } });
  if (!m) throw new Error("Member not found");
  const record = await prisma.personalRecord.create({
    data: { memberId, exercise, weight, reps },
  });
  revalidatePath(`/member`);
  return record;
}

export async function deletePR(prId: string, gymUserId: string) {
  // ponytail: relation filter verifies ownership in the delete query itself
  await prisma.personalRecord.delete({ where: { id: prId, member: { userId: gymUserId } } });
  revalidatePath(`/member`);
}

export async function updatePersonalRecord(
  prId: string,
  gymUserId: string,
  data: { exercise: string; weight: number; reps: number }
) {
  await prisma.personalRecord.update({
    where: { id: prId, member: { userId: gymUserId } },
    data: { exercise: data.exercise, weight: data.weight, reps: data.reps },
  });
  revalidatePath(`/member`);
}

export async function getPRs(memberId: string, gymUserId: string) {
  return prisma.personalRecord.findMany({
    where: { memberId, member: { userId: gymUserId } },
    orderBy: { date: "desc" },
  });
}

export async function checkInMember(memberId: string, gymUserId: string) {
  const now = await getNow();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [member, existing] = await Promise.all([
    prisma.member.findUnique({ where: { id: memberId, userId: gymUserId } }),
    prisma.attendance.findFirst({
      where: { memberId, checkInTime: { gte: startOfToday } },
    }),
  ]);
  if (!member) throw new Error("Member not found");
  if (existing) throw new Error("Already checked in today");
  if (member.status === "Frozen") throw new Error("Membership is frozen");
  if (member.status === "Expired") throw new Error("Membership has expired");
  if (member.status === "Overdue" && member.endDate) {
    const graceEnd = new Date(member.endDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    if ((await getNow()) > graceEnd) throw new Error("Membership has expired");
  }

  const record = await prisma.attendance.create({
    data: { userId: member.userId, memberId, memberName: member.firstName },
  });

  revalidatePath(`/member`);
  return record;
}

export async function hasCheckedInToday(memberId: string, gymUserId: string) {
  const now = await getNow();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const existing = await prisma.attendance.findFirst({
    where: {
      memberId,
      userId: gymUserId,
      checkInTime: { gte: startOfToday },
    },
  });
  return !!existing;
}

export async function getMemberById(memberId: string, gymUserId: string) {
  return prisma.member.findUnique({
    where: { id: memberId, userId: gymUserId },
    select: {
      id: true,
      firstName: true,
      status: true,
      userId: true,
      endDate: true,
      image: true,
    },
  });
}

export async function checkInMemberWithGPS(
  memberId: string,
  gymUserId: string,
  memberLat?: number,
  memberLng?: number,
) {
  const member = await prisma.member.findUnique({ where: { id: memberId, userId: gymUserId } });
  if (!member) throw new Error("Member not found");
  if (member.status === "Frozen") throw new Error("Membership is frozen");
  if (member.status === "Expired") throw new Error("Membership has expired");
  if (member.status === "Overdue" && member.endDate) {
    const graceEnd = new Date(member.endDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    if ((await getNow()) > graceEnd) throw new Error("Membership has expired");
  }

  const now = await getNow();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [config, existing] = await Promise.all([
    prisma.gymConfig.findUnique({ where: { userId: member.userId } }),
    prisma.attendance.findFirst({
      where: { memberId, checkInTime: { gte: startOfToday } },
    }),
  ]);
  if (existing) throw new Error("Already checked in today");

  if (config && config.gymLat !== null && config.gymLng !== null && config.gymRadius !== null) {
    if (memberLat === undefined || memberLng === undefined) {
      throw new Error("GPS location is required to verify you are at the gym");
    }
    const distance = getDistance(config.gymLat, config.gymLng, memberLat, memberLng);
    const maxRadius = config.gymRadius + 15;
    if (distance > maxRadius) {
      throw new Error(
        `You must be at the gym to check in. (${Math.round(distance)}m away, ${Math.round(maxRadius)}m allowed)`,
      );
    }
  }

  const record = await prisma.attendance.create({
    data: { userId: member.userId, memberId, memberName: member.firstName },
  });

  revalidatePath(`/member`);
  return record;
}
