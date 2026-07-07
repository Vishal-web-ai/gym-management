"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, Receipt, Settings, DollarSign } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { motion } from "motion/react";
import { usePrefetch } from "@/lib/hooks/usePrefetch";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/payments", label: "Payments", icon: DollarSign },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/attendance", label: "Attendance", icon: UserCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

const spring = { type: "spring" as const, stiffness: 500, damping: 35, mass: 0.8 };

export default function BottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const prefetch = usePrefetch();

  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/member" ||
    pathname.startsWith("/member/") ||
    pathname.startsWith("/check-in") ||
    pathname.startsWith("/access-denied");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] bg-bg-base/90 backdrop-blur-2xl pb-safe md:hidden">
      {isSignedIn && !isAuthPage ? (
        <>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                onPointerDown={() => prefetch(href)}
                className="relative flex flex-col items-center gap-0.5 px-4 py-2 text-xs min-h-[48px] min-w-[48px] justify-center"
              >
                {isActive && (
                  <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    size={22}
                    className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"}`}
                  />
                </motion.div>
                <span
                  className={`transition-colors duration-200 ${
                    isActive ? "font-semibold text-primary" : "text-text-muted"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </>
      ) : null}
    </nav>
  );
}
