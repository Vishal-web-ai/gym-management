import { Suspense } from "react";
import SettingsShell from "./SettingsShell";
import { requireAdminPage } from "@/lib/auth";

export default async function SettingsPage() {
  await requireAdminPage();

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>Settings</h1>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsShell />
      </Suspense>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse rounded-xl bg-white/5" />
      <div className="h-48 animate-pulse rounded-xl bg-white/5" />
      <div className="h-40 animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}
