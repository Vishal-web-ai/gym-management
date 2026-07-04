import {
  TrendingUp,
  Users,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { getDashboardStats, getMonthlyTrend } from "@/lib/actions/dashboard";
import { updateMemberStatuses } from "@/lib/actions/members";
import RevenueChart from "@/components/RevenueChart";
import DateDisplay from "@/components/DateDisplay";

type StatCard = {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: "primary" | "success" | "danger" | "info";
  delay: string;
};

const accentStyles: Record<string, string> = {
  primary: "bg-primary-subtle text-primary",
  success: "bg-emerald-500/10 text-emerald-400",
  danger: "bg-red-500/10 text-red-400",
  info: "bg-secondary/10 text-secondary",
};

function StatCard({ label, value, icon, accent, delay }: StatCard) {
  return (
    <div
      className={`glass-card flex items-center gap-4 rounded-xl p-4 animate-slide-up ${delay}`}
    >
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text-secondary">{label}</p>
        <p className="text-xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  let stats = { revenue: 0, activeCount: 0, overdueCount: 0, expenses: 0 };
  let monthlyTrend: { label: string; revenue: number; expenses: number }[] = [];
  let dashboardError: string | null = null;
  try {
    await updateMemberStatuses();
    [stats, monthlyTrend] = await Promise.all([
      getDashboardStats(),
      getMonthlyTrend(),
    ]);
  } catch (e) {
    dashboardError = e instanceof Error ? e.message : "Failed to load dashboard";
  }

  return (
    <div className="space-y-6 p-4">
      <div className="animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Dashboard
          </h1>
          <DateDisplay />
        </div>
        <div className="flex size-10 items-center justify-center">
          <UserButton />
        </div>
      </div>

      {dashboardError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          {dashboardError}
        </div>
      )}

      <div className="space-y-3">
        <StatCard
          label="Total Revenue (This Month)"
          value={`₹ ${stats.revenue.toLocaleString("en-IN")}`}
          icon={<TrendingUp size={22} />}
          accent="primary"
          delay="delay-1"
        />
        <StatCard
          label="Active Members"
          value={`${stats.activeCount} Active`}
          icon={<Users size={22} />}
          accent="success"
          delay="delay-2"
        />
        <StatCard
          label="Overdue Payments"
          value={`${stats.overdueCount} Overdue`}
          icon={<AlertTriangle size={22} />}
          accent="danger"
          delay="delay-3"
        />
        <StatCard
          label="Expenses (This Month)"
          value={`₹ ${stats.expenses.toLocaleString("en-IN")}`}
          icon={<Receipt size={22} />}
          accent="info"
          delay="delay-4"
        />
      </div>

      {monthlyTrend.length > 0 && (
        <div className="animate-slide-up delay-4">
          <RevenueChart data={monthlyTrend} />
        </div>
      )}

    </div>
  );
}
