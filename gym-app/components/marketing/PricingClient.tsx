"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Check, X, Zap, Crown, Dumbbell } from "lucide-react";
import Link from "next/link";
import MarketingHero from "./MarketingHero";
import WhatsAppModal from "@/components/WhatsAppModal";

const ease = [0.23, 1, 0.32, 1] as const;

const plans = [
  {
    name: "BASIC",
    price: "499",
    icon: Dumbbell,
    popular: false,
    description: "Perfect for beginners getting started with their fitness journey.",
    features: [
      "Full gym access",
      "Locker facility",
      "Basic workout tracking",
      "App access",
      "Mon-Sat timing",
    ],
  },
  {
    name: "PREMIUM",
    price: "999",
    icon: Zap,
    popular: true,
    description: "Our most popular plan for serious fitness enthusiasts.",
    features: [
      "Everything in Basic",
      "Personal trainer sessions",
      "Group classes access",
      "Advanced progress tracking",
      "Diet consultation",
      "Priority support",
    ],
  },
  {
    name: "VIP",
    price: "1,499",
    icon: Crown,
    popular: false,
    description: "The ultimate experience for those who demand the best.",
    features: [
      "Everything in Premium",
      "Unlimited PT sessions",
      "Custom diet plan",
      "Sauna & steam room",
      "Priority booking",
      "Guest passes (2/month)",
      "24/7 gym access",
    ],
  },
];

const comparisonFeatures = [
  { name: "Full Gym Access", basic: true, premium: true, vip: true },
  { name: "Locker Facility", basic: true, premium: true, vip: true },
  { name: "App Access", basic: true, premium: true, vip: true },
  { name: "Workout Tracking", basic: "Basic", premium: "Advanced", vip: "Advanced + AI" },
  { name: "Group Classes", basic: false, premium: true, vip: true },
  { name: "Personal Trainer", basic: false, premium: "4 sessions/mo", vip: "Unlimited" },
  { name: "Diet Consultation", basic: false, premium: true, vip: "Custom Plan" },
  { name: "Sauna & Steam", basic: false, premium: false, vip: true },
  { name: "24/7 Access", basic: false, premium: false, vip: true },
  { name: "Guest Passes", basic: false, premium: false, vip: "2/month" },
  { name: "Priority Support", basic: false, premium: true, vip: true },
  { name: "Priority Booking", basic: false, premium: false, vip: true },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-[#ff6a00] mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-white/15 mx-auto" />;
  return <span className="text-[13px] text-white/50 text-center">{value}</span>;
}

function PricingCards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative w-full py-16 md:py-24 px-5 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-12 md:mb-16"
        >
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6a00]/50"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            Pricing
          </span>
          <h2
            className="mt-3 text-[clamp(28px,5vw,48px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            CHOOSE YOUR <span className="text-[#ff6a00]">PLAN</span>
          </h2>
          <p
            className="mt-3 text-[14px] md:text-[16px] text-white/40 max-w-[500px] mx-auto"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Start with a free trial. No credit card required. Cancel anytime.
          </p>
        </motion.div>

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

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      plan.popular ? "bg-[#ff6a00]/20" : "bg-white/5"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        plan.popular ? "text-[#ff6a00]" : "text-white/60"
                      }`}
                    />
                  </div>
                  <span
                    className="text-sm font-bold uppercase tracking-wider text-white/70"
                    style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                  >
                    {plan.name}
                  </span>
                </div>

                <p
                  className="text-[13px] text-white/35 mb-5"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-[14px] text-white/40 mr-0.5">₹</span>
                  <span
                    className="text-[48px] md:text-[56px] font-black text-white leading-none"
                    style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[14px] text-white/40 ml-1">/month</span>
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          plan.popular ? "text-[#ff6a00]" : "text-white/40"
                        }`}
                      />
                      <span className="text-[14px] text-white/65">{feature}</span>
                    </li>
                  ))}
                </ul>

                <WhatsAppModal className={`flex items-center justify-center h-[48px] rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                    plan.popular
                      ? "bg-[#ff6a00] text-white hover:bg-[#ea580c] hover:shadow-lg hover:shadow-[#ff6a00]/20"
                      : "border border-white/15 text-white/80 hover:bg-white/5 hover:border-white/25"
                  }`}>
                  START FREE TRIAL
                </WhatsAppModal>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative w-full py-16 md:py-24 px-5 md:px-10">
      <div className="mx-auto max-w-[1000px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-10 md:mb-14"
        >
          <h2
            className="text-[clamp(24px,4vw,40px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            COMPARE <span className="text-[#ff6a00]">PLANS</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-5 text-[13px] font-bold uppercase tracking-wider text-white/40" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className={`p-5 text-center text-[13px] font-bold uppercase tracking-wider ${
                        plan.popular ? "text-[#ff6a00]" : "text-white/40"
                      }`}
                      style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={`border-b border-white/5 ${
                      i % 2 === 0 ? "bg-white/[0.01]" : ""
                    }`}
                  >
                    <td className="p-4 px-5 text-[14px] text-white/60">
                      {feature.name}
                    </td>
                    <td className="p-4 text-center">
                      <FeatureCell value={feature.basic} />
                    </td>
                    <td className="p-4 text-center">
                      <FeatureCell value={feature.premium} />
                    </td>
                    <td className="p-4 text-center">
                      <FeatureCell value={feature.vip} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/5">
            {comparisonFeatures.map((feature) => (
              <div key={feature.name} className="p-4">
                <p className="text-[13px] font-medium text-white/60 mb-3">
                  {feature.name}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>Basic</p>
                    <FeatureCell value={feature.basic} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[#ff6a00]/50 mb-1" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>Premium</p>
                    <FeatureCell value={feature.premium} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>VIP</p>
                    <FeatureCell value={feature.vip} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const faqs = [
    {
      q: "Can I switch plans later?",
      a: "Yes! You can upgrade or downgrade your plan at any time. The change will take effect at the start of your next billing cycle.",
    },
    {
      q: "Is there a joining fee?",
      a: "No, there are no hidden fees or joining charges. You only pay for your chosen plan.",
    },
    {
      q: "What's included in the free trial?",
      a: "The free trial gives you full access to the gym and all facilities for 7 days. No credit card required to start.",
    },
    {
      q: "Can I freeze my membership?",
      a: "Yes, Premium and VIP members can freeze their membership for up to 3 months per year at no extra cost.",
    },
    {
      q: "Do you offer student discounts?",
      a: "Yes! We offer a 15% discount for students with a valid student ID. Contact us for details.",
    },
  ];

  return (
    <section ref={ref} className="relative w-full py-16 md:py-24 px-5 md:px-10">
      <div className="mx-auto max-w-[800px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-10 md:mb-14"
        >
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6a00]/50"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            FAQ
          </span>
          <h2
            className="mt-3 text-[clamp(24px,4vw,40px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            COMMON <span className="text-[#ff6a00]">QUESTIONS</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease, delay: 0.1 + i * 0.08 }}
              className="glass-card rounded-xl p-5 md:p-6"
            >
              <h3
                className="text-[15px] font-bold text-white"
                style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
              >
                {faq.q}
              </h3>
              <p
                className="mt-2 text-[14px] text-white/40 leading-relaxed"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PricingClient() {
  return (
    <>
      <MarketingHero
        title="OUR"
        highlight="PRICING"
        subtitle="Transparent pricing with no hidden fees. Choose the plan that fits your goals."
      />
      <PricingCards />
      <ComparisonTable />
      <FAQSection />
    </>
  );
}
