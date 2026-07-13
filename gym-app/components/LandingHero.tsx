"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "motion/react";
import { Users, Star, Dumbbell, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import WhatsAppModal from "@/components/WhatsAppModal";

const ease = [0.23, 1, 0.32, 1] as const;

/* ── CountUp ── */

function CountUp({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target * 10) / 10);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {target % 1 !== 0 ? count.toFixed(1) : Math.round(count)}
      {suffix}
    </span>
  );
}

/* ── Floating embers ── */

const EMBER_CONFIG = [
  { left: "12%", size: 3, dur: 7, delay: 0, blur: 1 },
  { left: "28%", size: 2, dur: 9, delay: 1.5, blur: 0 },
  { left: "42%", size: 4, dur: 6, delay: 3, blur: 2 },
  { left: "58%", size: 2, dur: 8, delay: 0.8, blur: 1 },
  { left: "73%", size: 3, dur: 10, delay: 2.2, blur: 0 },
  { left: "88%", size: 2, dur: 7.5, delay: 4, blur: 1 },
  { left: "35%", size: 2, dur: 8.5, delay: 1, blur: 0 },
  { left: "65%", size: 3, dur: 6.5, delay: 3.5, blur: 2 },
];

function FloatingEmbers() {
  return (
    <div className="absolute inset-0 z-30 overflow-hidden pointer-events-none">
      {EMBER_CONFIG.map((e, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: e.left,
            bottom: "-10px",
            width: e.size,
            height: e.size,
            background: "radial-gradient(circle, #FF8A00, #FF6500)",
            boxShadow: `0 0 ${e.size * 3}px ${e.size}px rgba(255,138,0,0.4)`,
            filter: `blur(${e.blur}px)`,
            animation: `ember-rise ${e.dur}s ease-in infinite`,
            animationDelay: `${e.delay}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ── Atmospheric dust ── */

const DUST_CONFIG = [
  { left: "8%", top: "20%", size: 2, dur: 5, delay: 0 },
  { left: "18%", top: "45%", size: 1.5, dur: 6, delay: 1 },
  { left: "25%", top: "70%", size: 2, dur: 4.5, delay: 2 },
  { left: "38%", top: "15%", size: 1, dur: 7, delay: 0.5 },
  { left: "48%", top: "55%", size: 2, dur: 5.5, delay: 1.5 },
  { left: "55%", top: "80%", size: 1.5, dur: 6, delay: 3 },
  { left: "62%", top: "25%", size: 2, dur: 4, delay: 0.8 },
  { left: "72%", top: "60%", size: 1, dur: 7.5, delay: 2.5 },
  { left: "80%", top: "35%", size: 2, dur: 5, delay: 1.2 },
  { left: "88%", top: "75%", size: 1.5, dur: 6.5, delay: 0.3 },
  { left: "45%", top: "40%", size: 1, dur: 8, delay: 3.5 },
  { left: "92%", top: "50%", size: 2, dur: 5.5, delay: 2.8 },
];

function AtmosphericDust() {
  return (
    <div className="absolute inset-0 z-30 overflow-hidden pointer-events-none">
      {DUST_CONFIG.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: "rgba(255,160,60,0.6)",
            boxShadow: `0 0 ${d.size * 4}px ${d.size}px rgba(255,138,0,0.2)`,
            animation: `dust-float ${d.dur}s ease-in-out infinite`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main hero ── */

export default function LandingHero() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 150]);
  const textY = useTransform(scrollY, [0, 600], [0, -60]);
  const overlayOpacity = useTransform(scrollY, [0, 400], [0, 0.4]);

  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease,
          delay: 1.0 + i * 0.1,
        },
      }),
    }),
    []
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0604]">

      {/* ═══ LAYER 1: Background image (parallax) ═══ */}
      <motion.div
        className="absolute inset-0 z-[5] h-[120%] w-full"
        style={{ y: bgY }}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Image
          src="/herosection/back-glow.png"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
          style={{ objectPosition: "center 25%" }}
        />
      </motion.div>

      {/* ═══ LAYER 2: Dark texture ═══ */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-conic-gradient(rgba(255,255,255,0.06) 0% 25%, transparent 0% 50%)",
          backgroundSize: "4px 4px",
        }}
      />

      {/* ═══ LAYER 3: Orange smoke ═══ */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "120vw",
            height: "70vh",
            background:
              "radial-gradient(ellipse 100% 80% at 50% 60%, rgba(255,101,0,0.15), rgba(255,101,0,0.05) 50%, transparent 80%)",
            filter: "blur(60px)",
            animation: "smoke-drift 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute left-[45%] top-[35%] -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "80vw",
            height: "50vh",
            background:
              "radial-gradient(ellipse at 50% 70%, rgba(255,138,0,0.12), transparent 70%)",
            filter: "blur(80px)",
            animation: "smoke-drift 16s ease-in-out infinite",
            animationDelay: "3s",
          }}
        />
      </div>

      {/* ═══ LAYER 5: Light rays ═══ */}
      <div
        className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "min(900px, 100vw)",
          height: "min(900px, 100vw)",
          background:
            "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,138,0,0.06) 15deg, transparent 30deg, transparent 60deg, rgba(255,120,0,0.04) 75deg, transparent 90deg, transparent 120deg, rgba(255,138,0,0.05) 135deg, transparent 150deg, transparent 180deg, rgba(255,120,0,0.04) 195deg, transparent 210deg, transparent 240deg, rgba(255,138,0,0.06) 255deg, transparent 270deg, transparent 300deg, rgba(255,120,0,0.04) 315deg, transparent 330deg, transparent 360deg)",
          filter: "blur(30px)",
          opacity: 0.12,
          animation: "ray-pulse 5s ease-in-out infinite",
        }}
      />

      {/* ═══ LAYER 6: Gradient overlay ═══ */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "linear-gradient(to bottom, transparent 10%, black 100%)",
        }}
      />

      {/* ═══ LAYER 6b: Scroll darkening ═══ */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* ═══ LAYER 7: Content (parallax text) ═══ */}
      <motion.div className="relative z-40 flex h-full flex-col" style={{ y: textY }}>
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.6 }}
          className="shrink-0"
        >
          <div className="mx-auto flex h-[70px] md:h-[90px] max-w-[1400px] items-center justify-between px-5 md:px-10">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/logo.png"
                alt="Rajoria Fitness"
                width={855}
                height={292}
                sizes="120px"
                className="h-10 md:h-20 w-auto"
                priority
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "About", href: "/about" },
                { label: "Programs", href: "/programs" },
                { label: "Pricing", href: "/pricing" },
                { label: "Trainers", href: "/trainers" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium uppercase tracking-wider text-white/70 transition-colors duration-200 hover:text-[#ff6a00]"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="relative z-50 flex md:hidden items-center justify-center w-10 h-10 text-white"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                  {[
                    { label: "About", href: "/about" },
                    { label: "Programs", href: "/programs" },
                    { label: "Pricing", href: "/pricing" },
                    { label: "Trainers", href: "/trainers" },
                    { label: "Contact", href: "/contact" },
                  ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className="text-base font-medium uppercase tracking-wider text-white/80 transition-colors duration-200 hover:text-[#ff6a00]"
                        style={{ fontFamily: "var(--font-oswald)" }}
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-[#ff6a00]/20 bg-[#ff6a00]/5 px-4 py-1.5 md:px-5 md:py-2 backdrop-blur-sm md:hidden"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff6a00]/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff6a00]" />
          </span>
          <span
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#ff6a00]"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            #1 Rated Gym in India
          </span>
        </motion.div>

        {/* Hero content */}
        <main className="mx-auto flex max-w-[1400px] flex-1 flex-col items-center px-5 md:px-10 pb-[20px] md:pb-[28px] pt-24 md:pt-[90px] text-center">
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="leading-[0.9] tracking-[-1px] italic"
          >
            <span
              className="block text-[clamp(32px,7.5vw,90px)] font-black uppercase text-white"
              style={{
                fontFamily:
                  '"Spy Agency Semi-Italic", "Spy Agency", system-ui, sans-serif',
              }}
            >
              YOUR FITNESS
            </span>
            <span
              className="block text-[clamp(40px,9.2vw,110px)] font-black uppercase text-[#ff6a00]"
              style={{
                fontFamily:
                  '"Spy Agency Semi-Italic", "Spy Agency", system-ui, sans-serif',
              }}
            >
              STARTS HERE
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-1 md:mt-2 text-[clamp(22px,4.8vw,58px)] font-black italic uppercase"
            style={{
              fontFamily: "var(--font-oswald)",
              WebkitTextStroke: "1px #ff6a00",
              color: "transparent",
              textShadow: "0 0 30px rgba(255,106,0,0.15)",
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            NO LIMITS. ONLY PROGRESS.
          </motion.p>

          <motion.p
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-[16px] md:mt-[20px] max-w-[650px] text-[14px] md:text-[20px] leading-[1.5]"
            style={{
              fontFamily: "var(--font-jetbrains)",
              color: "rgba(255,255,255,0.78)",
            }}
          >
            Experience world-class equipment and expert guidance in a motivating
            environment designed for real results.
          </motion.p>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-[30px] md:mt-[28px] flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto"
          >
            <WhatsAppModal className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#ff6a00] px-6 text-xs md:text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-1 hover:brightness-110 hover:shadow-lg hover:shadow-[#ff6a00]/25 w-full md:w-[260px] h-[48px] md:h-[60px] cursor-pointer">
              START FREE TRIAL
            </WhatsAppModal>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#ff6a00] px-6 text-xs md:text-sm font-bold uppercase tracking-wide text-[#ff6a00] transition-all duration-200 hover:bg-[#ff6a00] hover:text-white w-full md:w-[260px] h-[48px] md:h-[60px]"
            >
              BOOK A TOUR
            </Link>
          </motion.div>

          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-[24px] md:mt-[28px] grid grid-cols-2 md:flex md:flex-wrap gap-x-6 md:gap-x-0 gap-y-3 place-items-center md:justify-center w-full md:w-auto max-w-[400px] md:max-w-none"
          >
            <StatItem
              icon={<Users className="h-5 w-5 md:h-7 md:w-7 text-[#ff6a00]" />}
              value="500+"
              valueNum={500}
              suffix="+"
              label="ACTIVE MEMBERS"
              isCountUp={false}
            />
            <div className="hidden md:block mx-8 h-10 w-px bg-white/15" />
            <StatItem
              icon={<Star className="h-5 w-5 md:h-7 md:w-7 text-[#ff6a00]" />}
              value="4.9"
              valueNum={4.9}
              suffix=""
              label="GOOGLE RATING"
              isCountUp={true}
            />
            <div className="hidden md:block mx-8 h-10 w-px bg-white/15" />
            <div className="col-span-2 md:col-span-1 flex justify-center">
            <StatItem
              icon={<Dumbbell className="h-5 w-5 md:h-7 md:w-7 text-[#ff6a00]" />}
              value="25+"
              valueNum={25}
              suffix="+"
              label="EXPERT TRAINERS"
              isCountUp={false}
            />
            </div>
          </motion.div>
        </main>
      </motion.div>

      {/* ═══ LAYER 9: Ground reflection ═══ */}
      <div
        className="absolute left-1/2 bottom-[15%] -translate-x-1/2 pointer-events-none z-[5]"
        style={{
          width: "80vw",
          maxWidth: 900,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,101,0,0.2) 0%, rgba(255,80,0,0.06) 60%, transparent 100%)",
          filter: "blur(40px)",
        }}
      />

      {/* ═══ LAYER 10: Dark vignette ═══ */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 40%, rgba(10,6,4,0.7) 100%)",
        }}
      />

      {/* ═══ LAYER 11: Floating embers ═══ */}
      <FloatingEmbers />

      {/* ═══ LAYER 12: Atmospheric dust ═══ */}
      <AtmosphericDust />
    </div>
  );
}

function StatItem({
  icon,
  value,
  valueNum,
  suffix,
  label,
  isCountUp,
}: {
  icon: React.ReactNode;
  value: string;
  valueNum: number;
  suffix: string;
  label: string;
  isCountUp: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 md:px-4">
      <div className="flex items-center gap-1.5 md:gap-2">
        {icon}
        <span
          className="text-lg md:text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          {isCountUp ? (
            <CountUp target={valueNum} suffix={suffix} />
          ) : (
            value
          )}
        </span>
      </div>
      <span
        className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#bdbdbd]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {label}
      </span>
    </div>
  );
}
