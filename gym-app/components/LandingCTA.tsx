"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import WhatsAppModal from "@/components/WhatsAppModal";

const ease = [0.23, 1, 0.32, 1] as const;

export default function LandingCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-12 md:py-16 px-5 md:px-10 overflow-hidden"
    >
      {/* Background glow — warm amber */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,138,0,0.1), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, ease }}
        className="relative mx-auto max-w-[800px] text-center"
      >
        {/* Decorative line */}
        <div className="w-16 h-1 bg-[#ff6a00] rounded-full mx-auto mb-8" />

        <h2
          className="text-[clamp(32px,6vw,64px)] font-black uppercase text-white leading-[0.95]"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
        >
          READY TO{" "}
          <span className="text-[#ff6a00]">TRANSFORM</span>?
        </h2>

        <p
          className="mt-5 text-[14px] md:text-[18px] text-white/50 max-w-[500px] mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Start your free trial today. No credit card required. Cancel
          anytime.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
          className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <WhatsAppModal className="group relative inline-flex items-center justify-center h-[52px] md:h-[56px] w-full sm:w-[260px] rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-1 hover:brightness-110 hover:shadow-xl hover:shadow-[#ff6a00]/25 cursor-pointer">
            <span className="relative z-10">START FREE TRIAL</span>
          </WhatsAppModal>

          <Link
            href="/pricing"
            className="inline-flex items-center justify-center h-[52px] md:h-[56px] w-full sm:w-[260px] rounded-xl border-2 border-white/15 text-sm font-bold uppercase tracking-wide text-white/70 transition-all duration-200 hover:bg-white/5 hover:border-white/25 hover:text-white"
          >
            VIEW PLANS
          </Link>
        </motion.div>

        <p className="mt-6 text-[12px] text-white/25">
          Trusted by 500+ members &middot; 4.9 Google Rating &middot; Free
          cancellation
        </p>
      </motion.div>
    </section>
  );
}
