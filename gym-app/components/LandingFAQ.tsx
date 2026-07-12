"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { ChevronDown } from "lucide-react";

const ease = [0.23, 1, 0.32, 1] as const;

const faqs = [
  {
    category: "Membership & Pricing",
    items: [
      {
        q: "How much does a membership cost?",
        a: "We offer three plans starting at ₹499/month for Basic, ₹999/month for Premium with personal training, and ₹1,499/month for VIP with unlimited perks. All plans come with a free trial.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes! You can start with a free trial to experience our facilities before committing. No credit card required — just sign up and visit.",
      },
      {
        q: "Can I freeze my membership?",
        a: "Absolutely. You can freeze your membership for up to 30 days per year through the app or by speaking with our front desk team.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI, debit/credit cards, net banking, and cash. You can manage all payments through our app.",
      },
      {
        q: "Is there a joining fee?",
        a: "No joining fee! We believe in keeping things simple. You only pay for your monthly plan.",
      },
    ],
  },
  {
    category: "Facilities & Timing",
    items: [
      {
        q: "What are the gym timings?",
        a: "We're open Monday to Saturday, 6:00 AM to 10:00 PM. VIP members enjoy 24/7 access. Sunday hours: 7:00 AM to 2:00 PM.",
      },
      {
        q: "What equipment do you have?",
        a: "We have state-of-the-art cardio machines, free weights, cable machines, functional training area, and dedicated zones for strength and hypertrophy training.",
      },
      {
        q: "Do you offer group classes?",
        a: "Yes! We offer Zumba, HIIT, yoga, spin classes, and more. Premium and VIP members get unlimited access to all group classes.",
      },
      {
        q: "Is parking available?",
        a: "Yes, we have free parking space for both two-wheelers and four-wheelers right outside the gym.",
      },
    ],
  },
  {
    category: "Trainers & Programs",
    items: [
      {
        q: "Are the trainers certified?",
        a: "All our trainers are internationally certified (ACE, NASM, or equivalent) with years of experience in strength training, weight loss, and rehabilitation.",
      },
      {
        q: "Do I get a personal trainer?",
        a: "Premium members get 8 personal training sessions/month, while VIP members get unlimited sessions. Basic members can add PT at an additional cost.",
      },
      {
        q: "Can I get a custom workout plan?",
        a: "Yes! Our trainers create personalized workout and diet plans based on your goals, fitness level, and medical history.",
      },
      {
        q: "Do you offer transformation programs?",
        a: "We run 12-week transformation challenges with dedicated coaching, diet planning, and progress tracking. Open to all members.",
      },
    ],
  },
  {
    category: "App & Technology",
    items: [
      {
        q: "How does the check-in app work?",
        a: "Simply open the app, tap check-in when you arrive, and your attendance is logged automatically. No cards or biometrics needed.",
      },
      {
        q: "Can I track my progress on the app?",
        a: "Yes! The app logs your attendance, tracks your payments, and lets you record personal records (PRs) for each exercise.",
      },
      {
        q: "Is the app free?",
        a: "The app is included free with all membership plans. Download it from the Play Store or App Store after signing up.",
      },
    ],
  },
  {
    category: "General Gym Info",
    items: [
      {
        q: "Where are you located?",
        a: "We're located at a prime, easily accessible location. Find us on Google Maps through our app or website for exact directions.",
      },
      {
        q: "Can I bring a friend to try out?",
        a: "Yes! You can bring a friend for a free trial session. They can also book a tour through our website.",
      },
      {
        q: "Do you have locker facilities?",
        a: "Yes, we provide clean, secure lockers for all members. Towel service is available for Premium and VIP members.",
      },
      {
        q: "What should I bring for my first visit?",
        a: "Just your workout clothes, shoes, and a water bottle. We provide lockers, so you can store your belongings safely.",
      },
    ],
  },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-start justify-between gap-4 w-full py-4 md:py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className={`text-[14px] md:text-[15px] font-medium transition-colors duration-200 ${
            isOpen ? "text-[#ff6a00]" : "text-white/80 group-hover:text-white"
          }`}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease }}
          className="shrink-0 mt-0.5"
        >
          <ChevronDown
            className={`h-4 w-4 transition-colors duration-200 ${
              isOpen ? "text-[#ff6a00]" : "text-white/30"
            }`}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <p className="text-[13px] md:text-[14px] text-white/50 leading-relaxed pb-4 md:pb-5">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingFAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex((prev) => (prev === key ? null : key));
  };

  return (
    <section
      ref={ref}
      id="faq"
      className="relative w-full py-12 md:py-16 px-5 md:px-10 overflow-hidden"
    >
      {/* Background glow — amber */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,138,0,0.04), transparent 70%)",
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
            FREQUENTLY ASKED{" "}
            <span className="text-[#ff6a00]">QUESTIONS</span>
          </h2>
          <p
            className="mt-3 text-[14px] md:text-[16px] text-white/50 max-w-[500px] mx-auto"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Everything you need to know before joining
          </p>
        </motion.div>

        {/* FAQ grid — mobile: single column, desktop: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {faqs.map((group, gi) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.2 + gi * 0.1 }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-wider text-[#ff6a00]/70 mb-3"
                style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
              >
                {group.category}
              </h3>
              <div>
                {group.items.map((item) => {
                  const key = `${gi}-${item.q}`;
                  return (
                    <FAQItem
                      key={key}
                      q={item.q}
                      a={item.a}
                      isOpen={openIndex === key}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
