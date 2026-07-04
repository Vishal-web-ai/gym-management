"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { createExpenseSchema, updateExpenseSchema } from "@/lib/validations";
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

export async function getExpenses() {
  const userId = await getUserId();
  return prisma().expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(formData: FormData) {
  const userId = await getUserId();
  const parsed = createExpenseSchema.parse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date"),
  });

  const expense = await prisma().expense.create({
    data: {
      userId,
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
  const userId = await getUserId();
  const parsed = updateExpenseSchema.parse({
    id: formData.get("id"),
    title: formData.get("title"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date"),
  });

  const expense = await prisma().expense.update({
    where: { id: parsed.id, userId },
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
  const userId = await getUserId();
  await prisma().expense.delete({ where: { id, userId } });
  logActivity("expense.deleted", JSON.stringify({ id }));
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
