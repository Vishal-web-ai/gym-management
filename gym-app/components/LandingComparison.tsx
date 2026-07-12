"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Check } from "lucide-react";

const ease = [0.23, 1, 0.32, 1] as const;

const comparisons = [
  {
    feature: "Equipment",
    others: "Outdated, limited selection",
    rajoria: "Premium, modern equipment",
  },
  {
    feature: "Trainers",
    others: "Generic, unqualified staff",
    rajoria: "Certified expert trainers",
  },
  {
    feature: "Hidden Fees",
    others: "Surprise charges & lock-ins",
    rajoria: "Transparent, no hidden fees",
  },
  {
    feature: "Classes",
    others: "Limited or extra charge",
    rajoria: "All classes included free",
  },
  {
    feature: "Diet Guidance",
    others: "Not included",
    rajoria: "Free diet consultation",
  },
  {
    feature: "Hygiene",
    others: "Average cleanliness",
    rajoria: "Hospital-grade cleanliness",
  },
  {
    feature: "Community",
    others: "No member support",
    rajoria: "Active, supportive community",
  },
  {
    feature: "Progress Tracking",
    others: "Manual or basic",
    rajoria: "Advanced app tracking",
  },
];

function ComparisonRow({
  item,
  index,
}: {
  item: (typeof comparisons)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease, delay: index * 0.07 }}
      className="flex flex-col gap-2 md:gap-0"
    >
      {/* Feature label — mobile only */}
      <span
        className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 text-center md:hidden"
        style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
      >
        {item.feature}
      </span>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_auto_1fr] md:gap-0 items-center">
        {/* Rajoria — left */}
        <div className="group relative flex items-center gap-2.5 px-3 py-3 md:px-6 md:py-4 rounded-xl bg-gradient-to-r from-[#ff6a00]/[0.08] to-[#ff6a00]/[0.02] border border-[#ff6a00]/20 transition-all duration-300 hover:border-[#ff6a00]/40 hover:shadow-[0_0_30px_-8px_rgba(255,106,0,0.15)]">
          <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
            <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-400" strokeWidth={3} />
          </div>
          <p className="text-[12px] md:text-[14px] text-white/90 leading-snug font-semibold">
            {item.rajoria}
          </p>
        </div>

        {/* Feature label — center (desktop) */}
        <div className="hidden md:flex items-center justify-center w-[160px] px-4">
          <span
            className="text-[13px] font-bold uppercase tracking-wider text-white/70 text-center"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            {item.feature}
          </span>
        </div>

        {/* Others — right */}
        <div className="flex items-center gap-2.5 px-3 py-3 md:px-6 md:py-4 rounded-xl bg-red-500/[0.04] border border-red-500/10">
          <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0">
            <span className="text-[12px] md:text-[14px] font-black text-red-400/70">✕</span>
          </div>
          <p className="text-[12px] md:text-[14px] text-white/40 leading-snug line-through decoration-white/20">
            {item.others}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingComparison() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-20 md:py-32 px-5 md:px-10 overflow-hidden"
    >
      {/* Background glow — stronger amber */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,106,0,0.08), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 30% 60%, rgba(255,80,0,0.05), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1100px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-14 md:mb-20"
        >
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6a00]/70"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            Why Us
          </span>
          <h2
            className="mt-3 text-[clamp(28px,6vw,52px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            WHY CHOOSE{" "}
            <span className="text-[#ff6a00]">RAJORIA FITNESS</span>
          </h2>
          <p
            className="mt-4 text-[14px] md:text-[16px] text-white/50 max-w-[500px] mx-auto"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Not all gyms are created equal. Here&apos;s what sets us apart from
            the rest.
          </p>
        </motion.div>

        {/* Column labels — desktop only, sticky */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-0 mb-6 px-5 sticky top-0 z-20 py-4 -mx-5 px-5 bg-[#0C0C0C]/80 backdrop-blur-md border-b border-white/5">
          <div className="text-left pl-5">
            <span
              className="text-[13px] font-bold uppercase tracking-wider text-[#ff6a00]"
              style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
            >
              Rajoria Fitness
            </span>
          </div>
          <div className="w-[160px]" />
          <div className="text-right pr-5">
            <span
              className="text-[13px] font-bold uppercase tracking-wider text-red-400/50"
              style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
            >
              Other Gyms
            </span>
          </div>
        </div>

        {/* Column labels — mobile only */}
        <div className="grid grid-cols-2 gap-2 mb-3 md:hidden">
          <div className="text-center">
            <span
              className="text-[11px] font-bold uppercase tracking-wider text-[#ff6a00]/80"
              style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
            >
              Rajoria
            </span>
          </div>
          <div className="text-center">
            <span
              className="text-[11px] font-bold uppercase tracking-wider text-red-400/40"
              style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
            >
              Others
            </span>
          </div>
        </div>

        {/* Comparison rows */}
        <div className="flex flex-col gap-2.5 md:gap-3.5">
          {comparisons.map((item, i) => (
            <ComparisonRow key={item.feature} item={item} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
          className="mt-12 md:mt-16 text-center"
        >
          <a
            href="/sign-up"
            className="inline-flex items-center justify-center h-[52px] px-8 rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-1 hover:brightness-110 hover:shadow-lg hover:shadow-[#ff6a00]/25"
          >
            START YOUR FREE TRIAL
          </a>
        </motion.div>
      </div>
    </section>
  );
}
