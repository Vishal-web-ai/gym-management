"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const ease = [0.23, 1, 0.32, 1] as const;

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Trainers", href: "/trainers" },
  { label: "Contact", href: "/contact" },
];

export default function MarketingNav() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: 0.1 }}
      className="relative z-50 shrink-0"
    >
      <div className="mx-auto flex h-[70px] md:h-[90px] max-w-[1400px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/logo.png"
            alt="Rajoria Fitness"
            width={855}
            height={292}
            sizes="120px"
            className="h-8 md:h-16 w-auto"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:text-[#ff6a00] ${
                pathname === item.href ? "text-[#ff6a00]" : "text-white/70"
              }`}
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-[42px] px-6 rounded-xl bg-[#ff6a00] text-xs font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#ff6a00]/25"
          >
            JOIN NOW
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          className="relative z-50 flex md:hidden items-center justify-center w-10 h-10 text-white"
          aria-label="Toggle navigation"
        >
          {mobileNavOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }}
            className="md:hidden overflow-hidden bg-black/90 backdrop-blur-md border-t border-white/5"
          >
            <div className="flex flex-col items-center gap-6 py-8">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`text-base font-medium uppercase tracking-wider transition-colors duration-200 hover:text-[#ff6a00] ${
                    pathname === item.href ? "text-[#ff6a00]" : "text-white/80"
                  }`}
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/sign-up"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex items-center justify-center h-[48px] w-[220px] rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white"
              >
                JOIN NOW
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
