"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createExpenseSchema, updateExpenseSchema } from "@/lib/validations";
import { logActivity } from "@/lib/actions/activity";

export async function getExpenses() {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  return prisma.expense.findMany({
    where: { userId: ownerId },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(formData: FormData) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const parsed = createExpenseSchema.parse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date"),
  });

  const expense = await prisma.expense.create({
    data: {
      userId: ownerId,
      title: parsed.title,
      amount: parsed.amount,
      category: parsed.category,
      date: new Date(parsed.date),
    },
  });

  logActivity("expense.created", JSON.stringify({ title: parsed.title, amount: parsed.amount }));
  revalidatePath("/expenses");
  revalidatePath("/dashboard");

  return expense;
}

export async function updateExpense(formData: FormData) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  const parsed = updateExpenseSchema.parse({
    id: formData.get("id"),
    title: formData.get("title"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date"),
  });

  const expense = await prisma.expense.update({
    where: { id: parsed.id, userId: ownerId },
    data: {
      title: parsed.title,
      amount: parsed.amount,
      category: parsed.category,
      date: new Date(parsed.date),
    },
  });

  logActivity("expense.updated", JSON.stringify({ id: parsed.id, title: parsed.title }));
  revalidatePath("/expenses");
  revalidatePath("/dashboard");

  return expense;
}

export async function deleteExpense(id: string) {
  const user = await requireAdmin();
  const ownerId = user.gymOwnerId;
  await prisma.expense.delete({ where: { id, userId: ownerId } });
  logActivity("expense.deleted", JSON.stringify({ id }));
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
