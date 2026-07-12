"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import MarketingNav from "./MarketingNav";

const ease = [0.23, 1, 0.32, 1] as const;

export default function MarketingHero({
  title,
  highlight,
  subtitle,
}: {
  title: string;
  highlight: string;
  subtitle: string;
}) {
  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: 0, y: 24 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease, delay: 0.3 + i * 0.12 },
      }),
    }),
    []
  );

  return (
    <div className="relative min-h-[70vh] md:min-h-screen w-full overflow-hidden flex flex-col">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "120vw",
            height: "60vh",
            background:
              "radial-gradient(ellipse 100% 80% at 50% 60%, rgba(255,101,0,0.12), rgba(255,101,0,0.04) 50%, transparent 80%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Light rays */}
      <div
        className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "min(700px, 100vw)",
          height: "min(700px, 100vw)",
          background:
            "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,138,0,0.04) 15deg, transparent 30deg, transparent 90deg, rgba(255,120,0,0.03) 105deg, transparent 120deg, transparent 180deg, rgba(255,138,0,0.04) 195deg, transparent 210deg, transparent 270deg, rgba(255,120,0,0.03) 285deg, transparent 300deg, transparent 360deg)",
          filter: "blur(30px)",
          opacity: 0.1,
          animation: "ray-pulse 5s ease-in-out infinite",
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent 30%, rgba(12,12,12,0.8) 100%)",
        }}
      />

      {/* Nav */}
      <MarketingNav />

      {/* Hero content */}
      <main className="relative z-20 flex flex-1 flex-col items-center justify-center px-5 md:px-10 pb-16 md:pb-24 pt-8 md:pt-0 text-center">
        <motion.h1
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="leading-[0.9] tracking-[-1px]"
        >
          <span
            className="block text-[clamp(36px,8vw,80px)] font-black uppercase text-white"
            style={{
              fontFamily:
                '"Spy Agency Semi-Italic", "Spy Agency", system-ui, sans-serif',
            }}
          >
            {title}
          </span>
          <span
            className="block text-[clamp(40px,9vw,100px)] font-black uppercase text-[#ff6a00]"
            style={{
              fontFamily:
                '"Spy Agency Semi-Italic", "Spy Agency", system-ui, sans-serif',
            }}
          >
            {highlight}
          </span>
        </motion.h1>

        <motion.p
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-6 md:mt-8 max-w-[600px] text-[14px] md:text-[18px] leading-[1.6]"
          style={{
            fontFamily: "var(--font-jetbrains)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {subtitle}
        </motion.p>
      </main>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to top, var(--color-bg-base), transparent)",
        }}
      />
    </div>
  );
}
