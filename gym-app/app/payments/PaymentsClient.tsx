"use client";

import { useState, useCallback } from "react";
import { DollarSign, ChevronLeft, ChevronRight, Loader2, Search, Banknote, Smartphone, CreditCard, FileDown } from "lucide-react";
import { getAllPayments } from "@/lib/actions/payments";
import { exportPaymentsCSV } from "@/lib/actions/members";
import { downloadReceiptPdf } from "@/lib/pdf";
import Link from "next/link";

const modeIcons: Record<string, React.ReactNode> = {
  Cash: <Banknote size={14} />,
  UPI: <Smartphone size={14} />,
  Card: <CreditCard size={14} />,
};

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

export default function PaymentsClient({
  initialPayments,
  initialTotal,
  initialHasMore,
}: {
  initialPayments: any[];
  initialTotal: number;
  initialHasMore: boolean;
}) {
  const [payments, setPayments] = useState<any[]>(initialPayments);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const take = 30;

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await getAllPayments(p);
      setPayments(result.payments);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(p);
    } catch {}
    setLoading(false);
  }, []);

  const filtered = search
    ? payments.filter((p) => {
        const name = (p.member?.firstName || "").toLowerCase();
        return name.includes(search.toLowerCase());
      })
    : payments;

  const totalPages = Math.ceil(total / take);

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Payments
        </h1>
        <div className="flex items-center gap-3">
          <button
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
            className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <FileDown size={14} />
            Export CSV
          </button>
          <span className="text-sm text-text-muted">
            {total} total
          </span>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          placeholder="Search by member name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/[0.04]">
            <DollarSign size={20} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-secondary">
            {search ? "No payments match your search." : "No payments recorded yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Link
              key={p.id}
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const name = p.member?.firstName || "";
                  downloadReceiptPdf(name, p.amount, p.mode, p.createdAt);
                }}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
              >
                <FileDown size={15} />
              </button>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => loadPage(page - 1)}
            disabled={page <= 1}
            className="flex size-9 items-center justify-center rounded-xl glass-card transition-all duration-200 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.95]"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 text-sm text-text-muted">{page} / {totalPages}</span>
          <button
            onClick={() => loadPage(page + 1)}
            disabled={page >= totalPages}
            className="flex size-9 items-center justify-center rounded-xl glass-card transition-all duration-200 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.95]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

    </div>
  );
}
