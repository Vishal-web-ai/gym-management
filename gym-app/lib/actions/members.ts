"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createMemberSchema,
  createMemberWithPaymentSchema,
  updateMemberSchema,
  logPaymentSchema,
  freezeMemberSchema,
} from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { getNow, getNowMs } from "@/lib/now";
import { logActivity } from "@/lib/actions/activity";
import { formatError } from "@/lib/actions/helpers";

function parseForm<T>(result: { success: true; data: T } | { success: false; error: unknown }) {
  if (result.success) return result.data;
  throw new Error(formatError(result.error));
}

export async function getMembers() {
  const user = await requireAdmin();
  return prisma.member.findMany({
    where: { userId: user.gymOwnerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMembersPaginated(skip = 0, take = 20) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const [members, total] = await prisma.$transaction([
    prisma.member.findMany({
      where: { userId: ownerId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.member.count({ where: { userId: ownerId } }),
  ]);
  return { members, total, hasMore: skip + take < total };
}

export async function getMemberById(id: string) {
  const user = await requireAdmin();
  await updateMemberStatuses().catch(() => {});
  return prisma.member.findUnique({
    where: { id, userId: user.gymOwnerId },
    include: { plan: true },
  });
}

export async function getPaymentsByMemberId(memberId: string) {
  const user = await requireAdmin();
  return prisma.payment.findMany({
    where: { memberId, userId: user.gymOwnerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMember(formData: FormData) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
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
    userId: ownerId,
    firstName: parsed.firstName,
    phone: parsed.phone,
    address: parsed.address || undefined,
    gender: parsed.gender || undefined,
    planId: parsed.planId || undefined,
    image: parsed.image || undefined,
    endDate: new Date(parsed.endDate),
  };

  await prisma.member.create({ data });
  logActivity("member.created", JSON.stringify({ name: parsed.firstName }));
  revalidatePath("/members");
}

export async function createMemberWithPayment(formData: FormData) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
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
    userId: ownerId,
    firstName: parsed.firstName,
    phone: parsed.phone,
    status: "Active",
    address: parsed.address || undefined,
    gender: parsed.gender || undefined,
    planId: parsed.planId || undefined,
    image: parsed.image || undefined,
    endDate: new Date(parsed.endDate),
  };

  const member = await prisma.member.create({ data: memberData });

  await prisma.payment.create({
    data: {
      userId: ownerId,
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
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
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

  await prisma.member.update({
    where: { id: parsed.id, userId: ownerId },
    data: updateData,
  });

  logActivity("member.updated", JSON.stringify({ id: parsed.id, name: parsed.firstName }));
  revalidatePath("/members");
  revalidatePath(`/members/${parsed.id}`);
}

export async function deleteMember(id: string) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const member = await prisma.member.findUnique({ where: { id, userId: ownerId } });
  if (!member) throw new Error("Member not found");
  await Promise.all([
    prisma.payment.deleteMany({ where: { memberId: id, userId: ownerId } }),
    prisma.attendance.updateMany({
      where: { memberId: id, userId: ownerId },
      data: { memberName: member.firstName },
    }),
  ]);
  await prisma.member.delete({ where: { id, userId: ownerId } });
  logActivity("member.deleted", JSON.stringify({ id }));
  revalidatePath("/members");
  redirect("/members");
}

export async function logPayment(formData: FormData) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const parsed = logPaymentSchema.parse({
    memberId: formData.get("memberId"),
    amount: formData.get("amount"),
    mode: formData.get("mode"),
    planId: formData.get("planId") || undefined,
    endDate: formData.get("endDate") || undefined,
  });

  const now = await getNow();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const existing = await prisma.payment.findFirst({
    where: {
      memberId: parsed.memberId,
      userId: ownerId,
      createdAt: { gte: startOfMonth },
    },
  });
  if (existing) throw new Error("Payment already logged this month");

  const payment = await prisma.payment.create({
    data: {
      userId: ownerId,
      memberId: parsed.memberId,
      amount: parsed.amount,
      mode: parsed.mode,
      status: "Paid",
    },
  });

  const total = await prisma.payment.aggregate({
    where: { memberId: parsed.memberId, userId: ownerId, status: "Paid" },
    _sum: { amount: true },
  });

  const updateData: Record<string, unknown> = { status: "Active" };
  if (parsed.planId) updateData.planId = parsed.planId;
  if (parsed.endDate) updateData.endDate = new Date(parsed.endDate);

  if ((total._sum.amount ?? 0) > 0) {
    await prisma.member.update({
      where: { id: parsed.memberId, userId: ownerId },
      data: updateData,
    });
  }

  logActivity("payment.logged", JSON.stringify({ memberId: parsed.memberId, amount: parsed.amount, mode: parsed.mode }));
  revalidatePath(`/members/${parsed.memberId}`);

  return payment;
}

export async function freezeMember(formData: FormData) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const parsed = freezeMemberSchema.parse({
    memberId: formData.get("memberId"),
  });

  await prisma.member.update({
    where: { id: parsed.memberId, userId: ownerId },
    data: { status: "Frozen", frozenAt: await getNow() },
  });

  logActivity("member.frozen", JSON.stringify({ memberId: parsed.memberId }));
  revalidatePath(`/members/${parsed.memberId}`);
}

export async function getOverdueMembers() {
  const user = await requireAdmin();
  return prisma.member.findMany({
    where: { userId: user.gymOwnerId, status: "Overdue" },
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
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const members = await prisma.member.findMany({
    where: { userId: ownerId },
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

export async function exportPaymentsCSV(month?: number, year?: number) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const where: Record<string, unknown> = { userId: ownerId };
  if (month !== undefined && year !== undefined) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    where.createdAt = { gte: start, lt: end };
  }
  const payments = await prisma.payment.findMany({
    where,
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

export async function exportExpensesCSV(month?: number, year?: number) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const where: Record<string, unknown> = { userId: ownerId };
  if (month !== undefined && year !== undefined) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    where.date = { gte: start, lt: end };
  }
  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  });
  const header = "Title,Amount,Category,Date\n";
  const rows = (expenses as CsvExpense[]).map((e) =>
    [`"${e.title}"`, e.amount, e.category, formatDate(e.date)].join(",")
  );
  return "\uFEFF" + header + rows.join("\n");
}

export async function unfreezeMember(formData: FormData) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const parsed = freezeMemberSchema.parse({
    memberId: formData.get("memberId"),
  });

  const [member, total] = await Promise.all([
    prisma.member.findUnique({
      where: { id: parsed.memberId, userId: ownerId },
    }),
    prisma.payment.aggregate({
      where: { memberId: parsed.memberId, userId: ownerId, status: "Paid" },
      _sum: { amount: true },
    }),
  ]);

  const newStatus = (total._sum.amount ?? 0) > 0 ? "Active" : "Overdue";
  const updateData: Record<string, unknown> = { status: newStatus, frozenAt: null };

  if (member?.frozenAt && member?.endDate) {
    const frozenDays = Math.ceil(
      ((await getNowMs()) - new Date(member.frozenAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    updateData.endDate = new Date(
      new Date(member.endDate).getTime() + frozenDays * 24 * 60 * 60 * 1000,
    );
  }

  await prisma.member.update({
    where: { id: parsed.memberId, userId: ownerId },
    data: updateData,
  });

  logActivity("member.unfrozen", JSON.stringify({ memberId: parsed.memberId }));
  revalidatePath(`/members/${parsed.memberId}`);
}

export async function importMembersCSV(formData: FormData) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
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

  const rowsToCreate: { userId: string; firstName: string; phone: string; gender?: string; address?: string; status: string }[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const name = cols[nameIdx] || "";
    const phone = cols[phoneIdx] || "";
    if (!name || !phone) {
      errors.push(`Row ${i + 1}: missing name or phone`);
      continue;
    }

    rowsToCreate.push({
      userId: ownerId,
      firstName: name,
      phone,
      gender: genderIdx !== -1 && cols[genderIdx] ? cols[genderIdx] : undefined,
      address: addressIdx !== -1 && cols[addressIdx] ? cols[addressIdx] : undefined,
      status: "Active",
    });
  }

  if (rowsToCreate.length > 0) {
    await prisma.$transaction(
      rowsToCreate.map((data) => prisma.member.create({ data }))
    );
  }

  logActivity("member.imported", JSON.stringify({ created: rowsToCreate.length, errors: errors.length }));
  revalidatePath("/members");

  return { created: rowsToCreate.length, errors };
}

export async function updateMemberStatuses() {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;

  const now = await getNow();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

  const config = await prisma.gymConfig.findUnique({
    where: { userId: ownerId },
    select: { lastStatusCheckAt: true },
  });

  if (config?.lastStatusCheckAt && config.lastStatusCheckAt > sixHoursAgo) return;

  const [activeOverdue] = await Promise.all([
    prisma.member.updateMany({
      where: { userId: ownerId, status: "Active", endDate: { lt: now } },
      data: { status: "Overdue" },
    }),
  ]);

  await prisma.gymConfig.upsert({
    where: { userId: ownerId },
    update: { lastStatusCheckAt: now },
    create: { userId: ownerId, lastStatusCheckAt: now },
  });

  if (activeOverdue.count > 0) {
    logActivity("member.status_auto", JSON.stringify({ from: "Active", to: "Overdue", count: activeOverdue.count }));
  }
}
