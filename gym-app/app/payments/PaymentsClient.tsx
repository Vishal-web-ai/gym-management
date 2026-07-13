"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DollarSign, ChevronLeft, ChevronRight, Loader2, Search, Banknote, Smartphone, CreditCard, FileDown, Receipt, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAllPayments } from "@/lib/actions/payments";
import { exportPaymentsCSV } from "@/lib/actions/members";
import { openWhatsApp, receiptMessage } from "@/lib/whatsapp";
import Link from "next/link";

const modeIcons: Record<string, React.ReactNode> = {
  Cash: <Banknote size={14} />,
  UPI: <Smartphone size={14} />,
  Card: <CreditCard size={14} />,
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 };

export default function PaymentsClient({
  initialPayments,
  initialTotal,
  initialHasMore,
  initialTotalAmount,
  gymName,
}: {
  initialPayments: any[];
  initialTotal: number;
  initialHasMore: boolean;
  initialTotalAmount: number;
  gymName?: string;
}) {
  const now = new Date();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [monthOpen, setMonthOpen] = useState(false);
  const monthRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["payments", page, month, year],
    queryFn: () => getAllPayments(page, month, year),
    placeholderData: keepPreviousData,
    initialData: page === 1 && month === now.getMonth() && year === now.getFullYear()
      ? { payments: initialPayments, total: initialTotal, hasMore: initialHasMore, totalAmount: initialTotalAmount }
      : undefined,
  });

  const payments = data?.payments ?? [];
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;
  const totalAmount = data?.totalAmount ?? 0;

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
    setPage(1);
  }, []);

  const filtered = search
    ? payments.filter((p: any) => {
        const name = (p.member?.firstName || "").toLowerCase();
        return name.includes(search.toLowerCase());
      })
    : payments;

  const totalPages = Math.ceil(total / 30);

  return (
    <div className="payments-page space-y-4 p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.05 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Payments <span className="text-sm font-normal text-text-muted">({total} total)</span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.1 }}
        className="glass-card flex items-center justify-between rounded-xl p-4"
      >
        <div>
          <p className="text-sm text-text-secondary">Total Payments</p>
          <p className="text-2xl font-bold text-text-primary">
            ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              const csv = await exportPaymentsCSV();
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded-xl bg-primary/15 px-3 py-2.5 text-sm font-medium text-primary min-h-[44px] flex items-center gap-1"
          >
            <FileDown size={16} />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      <div className="flex gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.15 }}
          className="flex-[7] min-w-0 self-stretch"
        >
          <div className="glass-card relative rounded-xl payments-search h-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search by member name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.2 }}
          className="flex-[5] min-w-0 self-stretch"
        >
          <div className="relative" ref={monthRef}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setMonthOpen(!monthOpen)}
              className="flex items-center justify-center gap-1.5 w-full text-center text-sm font-medium text-primary bg-primary/15 rounded-xl px-3 py-3.5 ring-1 ring-white/[0.08] border border-white/[0.08] transition-all duration-200"
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
        </motion.div>
      </div>

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-16"
        >
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springGentle }}
          className="glass-card rounded-xl p-12 text-center"
        >
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/[0.04]">
            <DollarSign size={20} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-secondary">
            {search ? "No payments match your search." : "No payments recorded yet."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ...springGentle, delay: 0.25 + i * 0.03 }}
              >
                <Link
                  href={`/members/${p.memberId}`}
                  className="glass-card flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-white/[0.06] hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    {modeIcons[p.mode] || <Banknote size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {p.member?.firstName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDate(p.createdAt)} at {formatTime(p.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-400">
                      +₹{p.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-text-muted">{p.mode}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const phone = p.member?.phone;
                      if (!phone) return;
                      const memberName = p.member?.firstName || "";
                      openWhatsApp(phone, receiptMessage(memberName, p.amount, p.mode, p.createdAt, gymName));
                    }}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-text-muted hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                  >
                    <Receipt size={15} />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 pt-2"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="flex size-9 items-center justify-center rounded-xl glass-card transition-all duration-200 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </motion.button>
          <span className="px-3 text-sm text-text-muted">{page} / {totalPages}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="flex size-9 items-center justify-center rounded-xl glass-card transition-all duration-200 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      )}

    </div>
  );
}
