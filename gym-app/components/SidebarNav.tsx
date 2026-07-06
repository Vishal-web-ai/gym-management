"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, Dumbbell, Receipt, Settings, DollarSign } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion } from "motion/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/payments", label: "Payments", icon: DollarSign },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/attendance", label: "Attendance", icon: UserCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

const spring = { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 };

export default function SidebarNav() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/member" || pathname.startsWith("/member/") ||
    pathname.startsWith("/check-in") ||
    pathname.startsWith("/access-denied");

  if (!isSignedIn || isAuthPage) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-white/[0.06] bg-bg-base md:flex">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...spring, delay: 0.1 }}
        className="flex items-center gap-3 border-b border-white/[0.06] px-6 h-16"
      >
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary-subtle">
          <Dumbbell size={20} className="text-primary" />
        </div>
        <span className="text-xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Gym Manager
        </span>
      </motion.div>
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navItems.map(({ href, label, icon: Icon }, index) => {
          const isActive = pathname.startsWith(href);
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.1 + index * 0.04 }}
            >
              <Link
                href={href}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium min-h-[44px] ${
                  isActive
                    ? "glass-card-active text-primary"
                    : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                )}
                <Icon size={20} />
                {label}
              </Link>
            </motion.div>
          );
        })}
      </nav>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="border-t border-white/[0.06] p-4"
      >
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted">
          <UserButton />
          <span>Account</span>
        </div>
      </motion.div>
    </aside>
  );
}
