"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import {
  createMemberSchema,
  createMemberWithPaymentSchema,
  updateMemberSchema,
  logPaymentSchema,
  freezeMemberSchema,
} from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/actions/activity";
import { formatError } from "@/lib/actions/helpers";
import type { PrismaClient } from "@/lib/generated/prisma/client";

let db: PrismaClient | null = null;

function prisma() {
  if (!db) db = getPrisma() as PrismaClient;
  return db;
}

function parseForm<T>(result: { success: true; data: T } | { success: false; error: unknown }) {
  if (result.success) return result.data;
  throw new Error(formatError(result.error));
}

async function getUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function getMembers() {
  const userId = await getUserId();
  return prisma().member.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMembersPaginated(skip = 0, take = 20) {
  const userId = await getUserId();
  const [members, total] = await Promise.all([
    prisma().member.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma().member.count({ where: { userId } }),
  ]);
  return { members, total, hasMore: skip + take < total };
}

export async function getMemberById(id: string) {
  const userId = await getUserId();
  return prisma().member.findUnique({
    where: { id, userId },
    include: { plan: true },
  });
}

export async function getPaymentsByMemberId(memberId: string) {
  const userId = await getUserId();
  return prisma().payment.findMany({
    where: { memberId, userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMember(formData: FormData) {
  const userId = await getUserId();
  const planId = (formData.get("planId") as string) || "";
  const rawEndDate = (formData.get("endDate") as string) || "";
  const parsed = parseForm(createMemberSchema.safeParse({
    firstName: formData.get("firstName"),
    phone: formData.get("phone"),
    address: formData.get("address") || "",
    gender: formData.get("gender"),
    planId,
    endDate: rawEndDate,
    image: formData.get("image"),
  }));

  const data = {
    userId,
    firstName: parsed.firstName,
    phone: parsed.phone,
    address: parsed.address || undefined,
    gender: parsed.gender || undefined,
    planId: parsed.planId || undefined,
    image: parsed.image || undefined,
    endDate: new Date(parsed.endDate),
  };

  await prisma().member.create({ data });
  logActivity("member.created", JSON.stringify({ name: parsed.firstName }));
  revalidatePath("/members");
}

export async function createMemberWithPayment(formData: FormData) {
  const userId = await getUserId();
  const planId = (formData.get("planId") as string) || "";
  const rawEndDate = (formData.get("endDate") as string) || "";
  const parsed = parseForm(createMemberWithPaymentSchema.safeParse({
    firstName: formData.get("firstName"),
    phone: formData.get("phone"),
    address: formData.get("address") || "",
    gender: formData.get("gender"),
    amount: formData.get("amount"),
    mode: formData.get("mode"),
    planId,
    endDate: rawEndDate,
    image: formData.get("image"),
  }));

  const memberData = {
    userId,
    firstName: parsed.firstName,
    phone: parsed.phone,
    status: "Active",
    address: parsed.address || undefined,
    gender: parsed.gender || undefined,
    planId: parsed.planId || undefined,
    image: parsed.image || undefined,
    endDate: new Date(parsed.endDate),
  };

  const member = await prisma().member.create({ data: memberData });

  await prisma().payment.create({
    data: {
      userId,
      memberId: member.id,
      amount: parsed.amount,
      mode: parsed.mode,
      status: "Paid",
    },
  });

  logActivity("member.created.with_payment", JSON.stringify({ name: parsed.firstName, amount: parsed.amount }));
  revalidatePath("/members");

  return { member, payment: { amount: parsed.amount, mode: parsed.mode } };
}

export async function updateMember(formData: FormData) {
  const userId = await getUserId();
  const planId = (formData.get("planId") as string) || "";
  const rawEndDate = (formData.get("endDate") as string) || "";
  const parsed = parseForm(updateMemberSchema.safeParse({
    id: formData.get("id"),
    firstName: formData.get("firstName"),
    phone: formData.get("phone"),
    address: formData.get("address") || "",
    gender: formData.get("gender"),
    status: formData.get("status"),
    planId,
    endDate: rawEndDate,
    image: formData.get("image"),
  }));

  const updateData: Record<string, unknown> = {
    firstName: parsed.firstName,
    phone: parsed.phone,
    status: parsed.status,
  };
  if (parsed.address) updateData.address = parsed.address;
  if (parsed.gender) updateData.gender = parsed.gender;
  if (parsed.planId) updateData.planId = parsed.planId;
  updateData.image = parsed.image; // can be string or null/empty string to clear
  updateData.endDate = new Date(parsed.endDate);

  await prisma().member.update({
    where: { id: parsed.id, userId },
    data: updateData,
  });

  logActivity("member.updated", JSON.stringify({ id: parsed.id, name: parsed.firstName }));
  revalidatePath("/members");
  revalidatePath(`/members/${parsed.id}`);
}

export async function deleteMember(id: string) {
  await requireAdmin();
  const userId = await getUserId();
  const member = await prisma().member.findUnique({ where: { id, userId } });
  if (!member) throw new Error("Member not found");
  await prisma().payment.deleteMany({ where: { memberId: id, userId } });
  await prisma().attendance.updateMany({
    where: { memberId: id, userId },
    data: { memberName: member.firstName },
  });
  await prisma().member.delete({ where: { id, userId } });
  logActivity("member.deleted", JSON.stringify({ id }));
  revalidatePath("/members");
}

export async function logPayment(formData: FormData) {
  const userId = await getUserId();
  const parsed = logPaymentSchema.parse({
    memberId: formData.get("memberId"),
    amount: formData.get("amount"),
    mode: formData.get("mode"),
    planId: formData.get("planId") || undefined,
    endDate: formData.get("endDate") || undefined,
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const existing = await prisma().payment.findFirst({
    where: {
      memberId: parsed.memberId,
      userId,
      createdAt: { gte: startOfMonth },
    },
  });
  if (existing) throw new Error("Payment already logged this month");

  const payment = await prisma().payment.create({
    data: {
      userId,
      memberId: parsed.memberId,
      amount: parsed.amount,
      mode: parsed.mode,
      status: "Paid",
    },
  });

  const total = await prisma().payment.aggregate({
    where: { memberId: parsed.memberId, userId, status: "Paid" },
    _sum: { amount: true },
  });

  const updateData: Record<string, unknown> = { status: "Active" };
  if (parsed.planId) updateData.planId = parsed.planId;
  if (parsed.endDate) updateData.endDate = new Date(parsed.endDate);

  if ((total._sum.amount ?? 0) > 0) {
    await prisma().member.update({
      where: { id: parsed.memberId, userId },
      data: updateData,
    });
  }

  logActivity("payment.logged", JSON.stringify({ memberId: parsed.memberId, amount: parsed.amount, mode: parsed.mode }));
  revalidatePath(`/members/${parsed.memberId}`);

  return payment;
}

export async function freezeMember(formData: FormData) {
  const userId = await getUserId();
  const parsed = freezeMemberSchema.parse({
    memberId: formData.get("memberId"),
  });

  await prisma().member.update({
    where: { id: parsed.memberId, userId },
    data: { status: "Frozen", frozenAt: new Date() },
  });

  logActivity("member.frozen", JSON.stringify({ memberId: parsed.memberId }));
  revalidatePath(`/members/${parsed.memberId}`);
}

export async function getOverdueMembers() {
  const userId = await getUserId();
  return prisma().member.findMany({
    where: { userId, status: "Overdue" },
    orderBy: { createdAt: "desc" },
  });
}

function formatDate(d: Date | string) {
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

type CsvMember = {
  firstName: string;
  phone: string;
  address: string | null;
  gender: string | null;
  status: string;
  createdAt: Date;
  endDate: Date | null;
};

type CsvPayment = {
  amount: number;
  mode: string;
  status: string;
  createdAt: Date;
  member: { firstName: string };
};

type CsvExpense = {
  title: string;
  amount: number;
  category: string;
  date: Date;
};

export async function exportMembersCSV() {
  const userId = await getUserId();
  const members = await prisma().member.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const header = "First Name,Phone,Address,Gender,Status,Join Date,End Date\n";
  const rows = (members as CsvMember[]).map((m) =>
    [
      `"${m.firstName}"`,
      `"${m.phone}"`,
      m.address ? `"${m.address}"` : "",
      m.gender || "",
      m.status,
      formatDate(m.createdAt),
      m.endDate ? formatDate(m.endDate) : "",
    ].join(",")
  );
  return "\uFEFF" + header + rows.join("\n");
}

export async function exportPaymentsCSV() {
  const userId = await getUserId();
  const payments = await prisma().payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { member: { select: { firstName: true } } },
  });
  const header = "Member Name,Amount,Mode,Status,Date\n";
  const rows = (payments as CsvPayment[]).map((p) =>
    [
      `"${p.member.firstName}"`,
      p.amount,
      p.mode,
      p.status,
      formatDate(p.createdAt),
    ].join(",")
  );
  return "\uFEFF" + header + rows.join("\n");
}

export async function exportExpensesCSV() {
  const userId = await getUserId();
  const expenses = await prisma().expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
  const header = "Title,Amount,Category,Date\n";
  const rows = (expenses as CsvExpense[]).map((e) =>
    [`"${e.title}"`, e.amount, e.category, formatDate(e.date)].join(",")
  );
  return "\uFEFF" + header + rows.join("\n");
}

export async function unfreezeMember(formData: FormData) {
  const userId = await getUserId();
  const parsed = freezeMemberSchema.parse({
    memberId: formData.get("memberId"),
  });

  const member = await prisma().member.findUnique({
    where: { id: parsed.memberId, userId },
  });

  const total = await prisma().payment.aggregate({
    where: { memberId: parsed.memberId, userId, status: "Paid" },
    _sum: { amount: true },
  });

  const newStatus = (total._sum.amount ?? 0) > 0 ? "Active" : "Overdue";
  const updateData: Record<string, unknown> = { status: newStatus, frozenAt: null };

  if (member?.frozenAt && member?.endDate) {
    const frozenDays = Math.ceil(
      (Date.now() - new Date(member.frozenAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    updateData.endDate = new Date(
      new Date(member.endDate).getTime() + frozenDays * 24 * 60 * 60 * 1000,
    );
  }

  await prisma().member.update({
    where: { id: parsed.memberId, userId },
    data: updateData,
  });

  logActivity("member.unfrozen", JSON.stringify({ memberId: parsed.memberId }));
  revalidatePath(`/members/${parsed.memberId}`);
}

export async function importMembersCSV(formData: FormData) {
  const userId = await getUserId();
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const text = await file.text();
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one member");

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const nameIdx = header.findIndex((h) => h.includes("first") || h === "name");
  const phoneIdx = header.findIndex((h) => h.includes("phone") || h.includes("mobile"));
  const genderIdx = header.findIndex((h) => h.includes("gender"));
  const addressIdx = header.findIndex((h) => h.includes("address"));

  if (nameIdx === -1 || phoneIdx === -1) {
    throw new Error("CSV must have at least 'First Name' and 'Phone' columns");
  }

  const created: string[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const name = cols[nameIdx] || "";
    const phone = cols[phoneIdx] || "";
    if (!name || !phone) {
      errors.push(`Row ${i + 1}: missing name or phone`);
      continue;
    }

    try {
      const data = {
        userId,
        firstName: name,
        phone,
        gender: genderIdx !== -1 && cols[genderIdx] ? cols[genderIdx] : undefined,
        address: addressIdx !== -1 && cols[addressIdx] ? cols[addressIdx] : undefined,
        status: "Active",
      };

      await prisma().member.create({ data });
      created.push(name);
    } catch (e) {
      errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }

  logActivity("member.imported", JSON.stringify({ created: created.length, errors: errors.length }));
  revalidatePath("/members");

  return { created: created.length, errors };
}

export async function updateMemberStatuses() {
  const { userId } = await auth();
  if (!userId) return;

  const now = new Date();
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const activeOverdue = await prisma().member.updateMany({
    where: { userId, status: "Active", endDate: { lt: now } },
    data: { status: "Overdue" },
  });

  const overdueExpired = await prisma().member.updateMany({
    where: { userId, status: "Overdue", endDate: { lt: tenDaysAgo } },
    data: { status: "Expired" },
  });

  if (activeOverdue.count > 0) {
    logActivity("member.status_auto", JSON.stringify({ from: "Active", to: "Overdue", count: activeOverdue.count }));
  }
  if (overdueExpired.count > 0) {
    logActivity("member.status_auto", JSON.stringify({ from: "Overdue", to: "Expired", count: overdueExpired.count }));
  }
}
