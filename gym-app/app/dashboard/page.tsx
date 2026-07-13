import { Suspense } from "react";
import { Settings } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { updateMemberStatuses } from "@/lib/actions/members";
import DateDisplay from "@/components/DateDisplay";
import { requireAdminPage } from "@/lib/auth";
import DashboardShell from "./DashboardShell";

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

export default async function DashboardPage() {
  await requireAdminPage();
  updateMemberStatuses().catch(() => {});

  return (
    <div className="space-y-6 px-4 pb-4 pt-4">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Dashboard
          </h1>
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/settings" className="flex h-9 w-9 items-center justify-center rounded-lg text-primary" aria-label="Settings">
              <Settings size={35} />
            </Link>
            <div className="dashboard-user-btn">
              <UserButton appearance={clerkAppearance} userProfileProps={{ appearance: userProfileAppearance }} />
            </div>
          </div>
        </div>
        <DateDisplay />
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardShell />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-white/5" />
    </>
  );
}
