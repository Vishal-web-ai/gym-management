"use client";

import { TrendingUp, Users, AlertTriangle, Receipt } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getMonthlyTrend } from "@/lib/actions/dashboard";
import { StatCardsWrapper, StatCardItem, ChartWrapper } from "@/components/DashboardAnimations";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("@/components/RevenueChart"), {
  loading: () => <div className="rounded-xl h-48 animate-pulse bg-white/5" />,
});

type StatCard = {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: "primary" | "success" | "danger" | "info";
};

const accentStyles: Record<string, string> = {
  primary: "bg-primary-subtle text-primary",
  success: "bg-emerald-500/10 text-emerald-400",
  danger: "bg-red-500/10 text-red-400",
  info: "bg-secondary/10 text-secondary",
};

function StatCard({ label, value, icon, accent }: StatCard) {
  return (
    <div className="glass-card flex items-center gap-4 rounded-xl p-4">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text-secondary">{label}</p>
        <p className="text-xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardShell() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [stats, monthlyTrend] = await Promise.all([
        getDashboardStats(),
        getMonthlyTrend(),
      ]);
      return { stats, monthlyTrend };
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <>
        <StatCardsWrapper>
          {[...Array(4)].map((_, i) => (
            <StatCardItem key={i}>
              <div className="h-24 animate-pulse rounded-xl bg-white/5" />
            </StatCardItem>
          ))}
        </StatCardsWrapper>
        <div className="h-48 animate-pulse rounded-xl bg-white/5" />
      </>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
        {error instanceof Error ? error.message : "Failed to load dashboard"}
      </div>
    );
  }

  const { stats, monthlyTrend } = data!;

  return (
    <>
      <StatCardsWrapper>
        <StatCardItem>
          <StatCard
            label="Total Revenue (This Month)"
            value={`₹ ${stats.revenue.toLocaleString("en-IN")}`}
            icon={<TrendingUp size={22} />}
            accent="primary"
          />
        </StatCardItem>
        <StatCardItem>
          <StatCard
            label="Active Members"
            value={`${stats.activeCount} Active`}
            icon={<Users size={22} />}
            accent="success"
          />
        </StatCardItem>
        <StatCardItem>
          <StatCard
            label="Overdue Payments"
            value={`${stats.overdueCount} Overdue`}
            icon={<AlertTriangle size={22} />}
            accent="danger"
          />
        </StatCardItem>
        <StatCardItem>
          <StatCard
            label="Expenses (This Month)"
            value={`₹ ${stats.expenses.toLocaleString("en-IN")}`}
            icon={<Receipt size={22} />}
            accent="info"
          />
        </StatCardItem>
      </StatCardsWrapper>

      {monthlyTrend.length > 0 && (
        <ChartWrapper>
          <RevenueChart data={monthlyTrend} />
        </ChartWrapper>
      )}
    </>
  );
}
