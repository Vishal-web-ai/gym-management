import {
  TrendingUp,
  Users,
  AlertTriangle,
  Receipt,
  Settings,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getDashboardStats, getMonthlyTrend } from "@/lib/actions/dashboard";
import { updateMemberStatuses } from "@/lib/actions/members";
import RevenueChart from "@/components/RevenueChart";
import DateDisplay from "@/components/DateDisplay";
import { StatCardsWrapper, StatCardItem, ChartWrapper } from "@/components/DashboardAnimations";
import { requireAdminPage } from "@/lib/auth";

const clerkAppearance = {
  variables: {
    colorPrimary: "#F97316",
    colorBackground: "#1C0E06",
    colorForeground: "#F97316",
    colorNeutral: "#FB923C",
    colorMuted: "#1C0E06",
    colorMutedForeground: "#FB923C",
    colorInput: "#1C0E06",
    colorInputForeground: "#FB923C",
    colorBorder: "rgba(249, 115, 22, 0.25)",
    colorShadow: "rgba(0, 0, 0, 0.6)",
    colorRing: "#F97316",
  },
  elements: {},
} as const;

const userProfileAppearance = {
  variables: {
    colorPrimary: "#F97316",
    colorBackground: "#1C0E06",
    colorForeground: "#F97316",
    colorNeutral: "#FB923C",
    colorMuted: "#1C0E06",
    colorMutedForeground: "#FB923C",
    colorInput: "#1C0E06",
    colorInputForeground: "#FB923C",
    colorBorder: "rgba(249, 115, 22, 0.25)",
    colorShadow: "rgba(0, 0, 0, 0.6)",
    colorRing: "#F97316",
  },
  elements: {},
} as const;

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
    <div
      className={`glass-card flex items-center gap-4 rounded-xl p-4`}
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
  await requireAdminPage();

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
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="flex size-10 items-center justify-center rounded-xl text-text-muted transition-all duration-200 hover:bg-white/[0.06] hover:text-text-primary"
              aria-label="Settings"
            >
              <Settings size={20} />
            </Link>
            <div className="flex size-10 items-center justify-center">
              <UserButton
                appearance={clerkAppearance}
                userProfileProps={{ appearance: userProfileAppearance }}
              />
            </div>
          </div>
        </div>
        <DateDisplay />
      </div>

      {dashboardError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          {dashboardError}
        </div>
      )}

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

    </div>
  );
}
