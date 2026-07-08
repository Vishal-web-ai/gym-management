"use client";

import { useState, useActionState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Receipt,
  Trash2,
  AlertCircle,
  IndianRupee,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 };
const springBtn = { type: "spring" as const, stiffness: 300, damping: 20 };

export default function ExpenseClient({
  initial,
}: {
  initial: any[];
}) {
  const [expenses, setExpenses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

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

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [monthOpen, setMonthOpen] = useState(false);
  const monthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) {
        setMonthOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToMonth = useCallback((m: number, y: number) => {
    setMonth(m);
    setYear(y);
  }, []);

  const prevMonth = useCallback(() => {
    if (month === 0) {
      goToMonth(11, year - 1);
    } else {
      goToMonth(month - 1, year);
    }
  }, [month, year, goToMonth]);

  const nextMonth = useCallback(() => {
    if (month === 11) {
      goToMonth(0, year + 1);
    } else {
      goToMonth(month + 1, year);
    }
  }, [month, year, goToMonth]);

  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
  const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth());

  const filteredExpenses = useMemo(() => expenses.filter((e: any) => {
    const d = new Date(e.date);
    const matchesMonth = d.getMonth() === month && d.getFullYear() === year;
    const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    return matchesMonth && matchesSearch;
  }), [expenses, month, year, search]);

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

  const total = filteredExpenses.reduce((s: number, e: any) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.1 }}
        className="glass-card flex items-center justify-between gap-3 rounded-xl p-4"
      >
        <div className="min-w-0">
          <p className="text-sm text-text-secondary">Total Expenses</p>
          <p className="text-2xl font-bold text-text-primary truncate">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              const { exportExpensesCSV } = await import("@/lib/actions/members");
              const csv = await exportExpensesCSV();
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "expenses.csv";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
            className="rounded-xl bg-primary/15 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/25 transition-all duration-200 min-h-[44px] flex items-center gap-1"
          >
            Export CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20 min-h-[44px]"
          >
            <Plus size={18} />
            Add
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.15 }}
        className="glass-card flex items-center gap-2 rounded-xl px-3 py-2"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={prevMonth}
          className="rounded-lg p-2 bg-primary/15 text-primary hover:bg-primary/25 transition-all duration-200"
        >
          <ChevronLeft size={18} />
        </motion.button>
        <div className="flex-1 relative" ref={monthRef}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setMonthOpen(!monthOpen)}
            className="flex items-center justify-center gap-1.5 w-full text-center text-sm font-medium text-primary bg-primary/15 rounded-lg px-3 py-1.5 transition-all duration-200"
          >
            {monthNames[month]} {year}
            <motion.div
              animate={{ rotate: monthOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {monthOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/[0.08] bg-bg-base/95 backdrop-blur-2xl shadow-2xl"
              >
                <div className="grid grid-cols-3 gap-px p-2">
                  {monthNames.map((name, i) => {
                    const disabled = year > now.getFullYear() || (year === now.getFullYear() && i > now.getMonth());
                    return (
                      <motion.button
                        key={i}
                        disabled={disabled}
                        whileHover={!disabled ? { scale: 1.05 } : undefined}
                        whileTap={!disabled ? { scale: 0.95 } : undefined}
                        onClick={() => {
                          goToMonth(i, year);
                          setMonthOpen(false);
                        }}
                        className={`rounded-lg px-2 py-1.5 text-xs transition-all ${
                          month === i
                            ? "bg-primary/20 text-primary font-medium"
                            : disabled
                              ? "text-text-muted/30 cursor-not-allowed"
                              : "text-text-muted hover:bg-white/[0.06] hover:text-text-primary"
                        }`}
                      >
                        {name}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={nextMonth}
          disabled={isCurrentMonth || isFutureMonth}
          className="rounded-lg p-2 bg-primary/15 text-primary hover:bg-primary/25 transition-all duration-200 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.2 }}
        className="relative"
      >
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
        />
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ ...springGentle }}
          >
            <div className="glass-card rounded-xl p-5">
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
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white disabled:opacity-50 min-h-[48px]"
                >
                  {isPending ? "Adding..." : "Add Expense"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredExpenses.length === 0 && !showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springGentle }}
          className="glass-card rounded-xl p-8 text-center"
        >
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/[0.04]">
            <Receipt size={20} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-secondary">No expenses recorded.</p>
        </motion.div>
      )}

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredExpenses.map((expense: any, i: number) =>
            editId === expense.id ? (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ...springGentle }}
                className="glass-card rounded-xl p-5"
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
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50 min-h-[44px]"
                    >
                      {editLoading ? "Saving..." : "Save"}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setEditId(null)}
                      className="rounded-lg bg-white/[0.06] px-4 py-2.5 text-sm text-text-muted hover:text-text-primary min-h-[44px]"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ...springGentle, delay: 0.15 + i * 0.03 }}
                className="glass-card flex items-center gap-3 sm:gap-4 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.06] hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Receipt size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">
                    {expense.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-muted">
                    <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-0.5">
                      {expense.category}
                    </span>
                    <span className="shrink-0">
                      {new Date(expense.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                  <p className="text-sm font-semibold text-text-primary text-nowrap">
                    <IndianRupee size={12} className="inline" />
                    {expense.amount.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditId(expense.id)}
                      aria-label="Edit expense"
                      className="flex size-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-secondary/10 hover:text-secondary"
                    >
                      <Pencil size={14} />
                    </motion.button>
                    {deleteId === expense.id ? (
                      <div className="flex items-center gap-1">
                        {deleteError && (
                          <span className="text-xs text-red-400">{deleteError}</span>
                        )}
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-medium text-white hover:opacity-90 min-h-[32px]"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="rounded-lg bg-white/[0.06] px-2 py-1.5 text-xs text-text-muted hover:text-text-primary min-h-[32px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteId(expense.id)}
                        aria-label="Delete expense"
                        className="flex size-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ),
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
