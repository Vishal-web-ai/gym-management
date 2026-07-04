"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, Dumbbell, Receipt, Settings, DollarSign } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/payments", label: "Payments", icon: DollarSign },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/attendance", label: "Attendance", icon: UserCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/member" || pathname.startsWith("/member/") ||
    pathname.startsWith("/check-in");

  if (!isSignedIn || isAuthPage) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-white/[0.06] bg-bg-base md:flex">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 h-16">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary-subtle">
          <Dumbbell size={20} className="text-primary" />
        </div>
        <span className="text-xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Gym Manager
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 min-h-[44px] active:scale-[0.97] ${
                isActive
                  ? "glass-card-active text-primary"
                  : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary animate-forge-glow" />
              )}
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted">
          <UserButton />
          <span>Account</span>
        </div>
      </div>
    </aside>
  );
}
