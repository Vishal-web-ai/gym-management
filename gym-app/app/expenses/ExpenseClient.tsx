"use client";

import { useState, useActionState } from "react";
import {
  Plus,
  Receipt,
  Trash2,
  AlertCircle,
  IndianRupee,
  Pencil,
} from "lucide-react";
import Select from "@/components/Select";
import { createExpense, deleteExpense, updateExpense } from "@/lib/actions/expenses";
import { formatError } from "@/lib/actions/helpers";

const categories = [
  "Equipment",
  "Maintenance",
  "Utilities",
  "Supplies",
  "Marketing",
  "Rent",
  "Other",
];

export default function ExpenseClient({
  initial,
  csvData = "",
}: {
  initial: any[];
  csvData?: string;
}) {
  const [expenses, setExpenses] = useState(initial);
  const [showForm, setShowForm] = useState(false);

  const [error, dispatch, isPending] = useActionState(
    async (_: string | null, formData: FormData) => {
      try {
        const expense = await createExpense(formData);
        setExpenses((prev) => [expense, ...prev]);
        setShowForm(false);
      } catch (e) {
        return formatError(e);
      }
      return null;
    },
    null,
  );

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleteError(null);
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e: any) => e.id !== id));
      setDeleteId(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete expense");
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("id", id);
      const updated = await updateExpense(formData);
      setExpenses((prev) => prev.map((x: any) => (x.id === id ? updated : x)));
      setEditId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update expense");
    } finally {
      setEditLoading(false);
    }
  }

  const total = expenses.reduce((s: number, e: any) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="glass-card flex items-center justify-between rounded-xl p-4">
        <div>
          <p className="text-sm text-text-secondary">Total Expenses</p>
          <p className="text-2xl font-bold text-text-primary">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex gap-2">
          {csvData && (
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`}
              download="expenses.csv"
              className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors min-h-[44px] flex items-center gap-1"
            >
              Export CSV
            </a>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:opacity-90 active:scale-[0.98] min-h-[44px]"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-5 animate-slide-down">
          <h3 className="mb-4 text-sm font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            New Expense
          </h3>
          <form action={dispatch} className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <input
              name="title"
              required
              placeholder="Title"
              className="w-full rounded-lg bg-white/[0.04] px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
            />
            <div className="flex gap-3">
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="Amount"
                autoComplete="off"
                className="flex-1 rounded-lg bg-white/[0.04] px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
              />
              <input
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="flex-1 rounded-lg bg-white/[0.04] px-4 py-3 text-sm text-text-primary outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06] min-h-[48px]"
              />
            </div>
            <Select
              name="category"
              required
              placeholder="Select category"
              options={categories.map((c) => ({ value: c, label: c }))}
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
            >
              {isPending ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </div>
      )}

      {expenses.length === 0 && !showForm && (
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/[0.04]">
            <Receipt size={20} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-secondary">No expenses recorded.</p>
        </div>
      )}

      <div className="space-y-2">
        {expenses.map((expense: any) =>
          editId === expense.id ? (
            <div
              key={expense.id}
              className="glass-card rounded-xl p-5 animate-slide-down"
            >
              <h4 className="mb-3 text-sm font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                Edit Expense
              </h4>
              {editError && (
                <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}
              <form
                onSubmit={(e) => handleEdit(e, expense.id)}
                className="space-y-3"
              >
                <input
                  name="title"
                  required
                  defaultValue={expense.title}
                  className="w-full rounded-lg bg-white/[0.04] px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
                />
                <div className="flex gap-3">
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={expense.amount}
                    autoComplete="off"
                    className="flex-1 rounded-lg bg-white/[0.04] px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
                  />
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={new Date(expense.date).toISOString().split("T")[0]}
                    className="flex-1 rounded-lg bg-white/[0.04] px-4 py-3 text-sm text-text-primary outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06] min-h-[48px]"
                  />
                </div>
                <Select
                  name="category"
                  required
                  value={expense.category}
                  options={categories.map((c) => ({ value: c, label: c }))}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
                  >
                    {editLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditId(null)}
                    className="rounded-lg bg-white/[0.06] px-4 py-2.5 text-sm text-text-muted transition-colors hover:text-text-primary min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div
              key={expense.id}
              className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.06] hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Receipt size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-primary">
                  {expense.title}
                </p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
                  <span className="rounded-md bg-white/[0.04] px-2 py-0.5">
                    {expense.category}
                  </span>
                  <span>
                    {new Date(expense.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-text-primary">
                  <IndianRupee size={12} className="inline" />
                  {expense.amount.toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditId(expense.id)}
                    aria-label="Edit expense"
                    className="flex size-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-secondary/10 hover:text-secondary"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteId === expense.id ? (
                    <div className="flex flex-col gap-1">
                      {deleteError && (
                        <span className="text-xs text-red-400">{deleteError}</span>
                      )}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 min-h-[32px]"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs text-text-muted transition-colors hover:text-text-primary min-h-[32px]"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(expense.id)}
                      aria-label="Delete expense"
                      className="flex size-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
