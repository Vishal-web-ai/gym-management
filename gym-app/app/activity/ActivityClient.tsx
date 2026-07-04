"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Snowflake,
  DollarSign,
  Receipt,
  Trash2,
  Pencil,
  ScanQrCode,
  UserCog,
  Building2,
  Check,
} from "lucide-react";
import { getActivityLogs } from "@/lib/actions/activity";

const actionLabels: Record<string, string> = {
  "member.created": "Member Created",
  "member.created.with_payment": "Member Created (with payment)",
  "member.updated": "Member Updated",
  "member.deleted": "Member Deleted",
  "member.frozen": "Member Frozen",
  "member.unfrozen": "Member Unfrozen",
  "payment.logged": "Payment Logged",
  "expense.created": "Expense Created",
  "expense.updated": "Expense Updated",
  "expense.deleted": "Expense Deleted",
  "plan.updated": "Plan Updated",
  "plan.deleted": "Plan Deleted",
  "settings.gym_name.updated": "Gym Name Changed",
  "settings.owner_name.updated": "Owner Name Changed",
  "attendance.checkin": "Attendance Check-in",
};

const actionGroups: { label: string; value: string }[] = [
  { label: "All", value: "" },
  ...Object.entries(actionLabels).map(([value, label]) => ({ label, value })),
];

const actionIcons: Record<string, React.ReactNode> = {
  "member.created": <UserPlus size={16} />,
  "member.created.with_payment": <UserPlus size={16} />,
  "member.updated": <Pencil size={16} />,
  "member.deleted": <UserMinus size={16} />,
  "member.frozen": <Snowflake size={16} />,
  "member.unfrozen": <UserCheck size={16} />,
  "payment.logged": <DollarSign size={16} />,
  "expense.created": <Receipt size={16} />,
  "expense.updated": <Pencil size={16} />,
  "expense.deleted": <Trash2 size={16} />,
  "plan.updated": <Pencil size={16} />,
  "plan.deleted": <Trash2 size={16} />,
  "settings.gym_name.updated": <Building2 size={16} />,
  "settings.owner_name.updated": <UserCog size={16} />,
  "attendance.checkin": <ScanQrCode size={16} />,
};

const accentMap: Record<string, string> = {
  member: "bg-primary-subtle text-primary",
  expense: "bg-orange-500/10 text-orange-400",
  payment: "bg-emerald-500/10 text-emerald-400",
  plan: "bg-violet-500/10 text-violet-400",
  settings: "bg-slate-500/10 text-slate-400",
  attendance: "bg-blue-500/10 text-blue-400",
};

function getAccent(action: string) {
  const key = Object.keys(accentMap).find((k) => action.startsWith(k));
  return accentMap[key || "member"];
}

function renderDetails(action: string, details: string | null) {
  if (!details) return null;
  try {
    const d = JSON.parse(details);
    switch (action) {
      case "member.created":
      case "member.created.with_payment":
        return (
          <span>
            {d.name}
            {d.amount ? ` — ₹${d.amount.toLocaleString("en-IN")}` : ""}
          </span>
        );
      case "member.updated":
        return <span>{d.name}</span>;
      case "member.deleted":
        return <span>ID: {d.id?.slice(0, 8)}...</span>;
      case "member.frozen":
      case "member.unfrozen":
        return <span>ID: {d.memberId?.slice(0, 8)}...</span>;
      case "payment.logged":
        return (
          <span>
            ₹{d.amount?.toLocaleString("en-IN")}{d.mode ? ` via ${d.mode}` : ""}
          </span>
        );
      case "expense.created":
        return (
          <span>
            {d.title} — ₹{d.amount?.toLocaleString("en-IN")}
          </span>
        );
      case "expense.updated":
        return <span>{d.title}</span>;
      case "expense.deleted":
        return <span>ID: {d.id?.slice(0, 8)}...</span>;
      case "plan.updated":
        return <span>{d.name}</span>;
      case "plan.deleted":
        return <span>ID: {d.id?.slice(0, 8)}...</span>;
      case "settings.gym_name.updated":
        return <span>{d.gymName}</span>;
      case "settings.owner_name.updated":
        return <span>{d.ownerName}</span>;
      case "attendance.checkin":
        return <span>{d.name}</span>;
      default:
        return <span className="font-mono text-[10px] opacity-60">{details}</span>;
    }
  } catch {
    return <span className="font-mono text-[10px] opacity-60">{details}</span>;
  }
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function groupByDate(logs: ActivityLog[]) {
  const map = new Map<string, ActivityLog[]>();
  for (const log of logs) {
    const key = new Date(log.createdAt).toDateString();
    const group = map.get(key);
    if (group) group.push(log);
    else map.set(key, [log]);
  }
  return map;
}

type ActivityLog = {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
};

export default function ActivityClient({
  initialLogs,
  initialTotal,
}: {
  initialLogs: ActivityLog[];
  initialTotal: number;
}) {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const take = 30;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.ceil(total / take);

  const loadPage = useCallback(
    async (p: number, actionFilter: string) => {
      setLoading(true);
      try {
        const result = await getActivityLogs(p, actionFilter || undefined);
        setLogs(result.logs);
        setTotal(result.total);
        setPage(p);
      } catch {}
      setLoading(false);
    },
    [],
  );

  const handleFilterChange = (value: string) => {
    setFilter(value);
    loadPage(1, value);
  };

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Activity Log
        </h1>
        <Filter size={18} className="text-text-muted" />
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-text-primary outline-none ring-1 ring-white/[0.08] transition-all duration-200 hover:bg-white/[0.06] focus:ring-2 focus:ring-primary/50"
        >
          <Filter size={16} className="shrink-0 text-text-muted" />
          <span className="flex-1 text-left">
            {filter ? actionLabels[filter] || filter : "All Activity"}
          </span>
          <ChevronRight size={14} className={`shrink-0 text-text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-90" : ""}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/[0.08] bg-bg-base/95 backdrop-blur-2xl p-1 shadow-2xl animate-scale-in">
            {actionGroups.map((g) => {
              const selected = filter === g.value;
              return (
                <button
                  key={g.value}
                  onClick={() => {
                    handleFilterChange(g.value);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    selected
                      ? "bg-primary/15 text-primary"
                      : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                  }`}
                >
                  <span className={`flex-1 text-left ${selected ? "font-medium" : ""}`}>{g.label}</span>
                  {selected && <Check size={14} className="shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/[0.04]">
            <Filter size={20} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-secondary">No activity found.</p>
          <p className="mt-1 text-xs text-text-muted">
            {filter ? "Try a different filter." : "Activity will appear as you use the app."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groupByDate(logs).entries()).map(([dateKey, dateLogs]) => (
            <div key={dateKey} className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                {formatDateLabel(dateLogs[0].createdAt)}
              </h2>
              <div className="space-y-2">
                {dateLogs.map((log) => (
                  <div
                    key={log.id}
                    className="glass-card flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-white/[0.03]"
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${getAccent(log.action)}`}
                    >
                      {actionIcons[log.action] || <Filter size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {actionLabels[log.action] || log.action}
                      </p>
                      {log.details && (
                        <p className="mt-0.5 truncate text-xs text-text-muted">
                          {renderDetails(log.action, log.details)}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 whitespace-nowrap text-xs text-text-muted">
                      {formatTime(log.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => loadPage(page - 1, filter)}
            disabled={page <= 1}
            className="flex size-9 items-center justify-center rounded-xl glass-card transition-all duration-200 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.95]"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => loadPage(page + 1, filter)}
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
