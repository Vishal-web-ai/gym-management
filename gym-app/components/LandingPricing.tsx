"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Check, Zap, Crown, Dumbbell } from "lucide-react";
import Link from "next/link";

const ease = [0.23, 1, 0.32, 1] as const;

/* ── Replace with your actual gym plans ── */

const plans = [
  {
    name: "BASIC",
    price: "499",
    period: "/month",
    icon: Dumbbell,
    popular: false,
    features: [
      "Full gym access",
      "Locker facility",
      "Basic workout tracking",
      "App access",
      "Mon-Sat timing",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "PREMIUM",
    price: "999",
    period: "/month",
    icon: Zap,
    popular: true,
    features: [
      "Everything in Basic",
      "Personal trainer sessions",
      "Group classes access",
      "Advanced progress tracking",
      "Diet consultation",
      "Priority support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "VIP",
    price: "1,499",
    period: "/month",
    icon: Crown,
    popular: false,
    features: [
      "Everything in Premium",
      "Unlimited PT sessions",
      "Custom diet plan",
      "Sauna & steam room",
      "Priority booking",
      "Guest passes (2/month)",
      "24/7 gym access",
    ],
    cta: "Start Free Trial",
  },
];

export default function LandingPricing() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="pricing"
      className="relative w-full py-12 md:py-16 px-5 md:px-10 overflow-hidden"
    >
      {/* Background glow — violet */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(124,58,237,0.05), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px]">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-12 md:mb-16"
        >
          <h2
            className="text-[clamp(28px,5vw,48px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            CHOOSE YOUR{" "}
            <span className="text-[#ff6a00]">PLAN</span>
          </h2>
          <p
            className="mt-3 text-[14px] md:text-[16px] text-white/50 max-w-[500px] mx-auto"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Start with a free trial. No credit card required.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-start">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease, delay: 0.2 + i * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.3, ease } }}
                className={`relative rounded-2xl p-6 md:p-8 flex flex-col ${
                  plan.popular
                    ? "bg-gradient-to-b from-[#ff6a00]/10 to-[#ff6a00]/[0.02] border-2 border-[#ff6a00]/40 shadow-[0_0_40px_-10px_rgba(255,106,0,0.2)]"
                    : "glass-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ff6a00] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-[#ff6a00]/20" : "bg-white/5"
                  }`}>
                    <Icon className={`h-5 w-5 ${plan.popular ? "text-[#ff6a00]" : "text-white/60"}`} />
                  </div>
                  <span
                    className="text-sm font-bold uppercase tracking-wider text-white/70"
                    style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                  >
                    {plan.name}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-[14px] text-white/40 mr-0.5">₹</span>
                  <span
                    className="text-[48px] md:text-[56px] font-black text-white leading-none"
                    style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[14px] text-white/40 ml-1">{plan.period}</span>
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${
                        plan.popular ? "text-[#ff6a00]" : "text-white/40"
                      }`} />
                      <span className="text-[14px] text-white/65">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className={`flex items-center justify-center h-[48px] rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                    plan.popular
                      ? "bg-[#ff6a00] text-white hover:bg-[#ea580c] hover:shadow-lg hover:shadow-[#ff6a00]/20"
                      : "border border-white/15 text-white/80 hover:bg-white/5 hover:border-white/25"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
