"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import { Clock, Users, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import MarketingHero from "./MarketingHero";
import WhatsAppModal from "@/components/WhatsAppModal";

const ease = [0.23, 1, 0.32, 1] as const;

const programs = [
  {
    name: "Weight Training",
    tagline: "Build raw strength.",
    description:
      "Comprehensive strength training program using free weights, machines, and guided hypertrophy programs. Perfect for building muscle mass and increasing overall strength.",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&h=500&fit=crop",
    icon: "🏋️",
    schedule: "Mon — Sat, 6 AM — 10 PM",
    level: "All Levels",
    features: ["Free Weights", "Machine Circuit", "Guided Programs", "Progress Tracking"],
  },
  {
    name: "Cardio Training",
    tagline: "Torch calories.",
    description:
      "High-energy cardio sessions using treadmills, cycles, rowing machines, and more. Build endurance, burn fat, and improve cardiovascular health.",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=700&h=500&fit=crop",
    icon: "🏃",
    schedule: "Mon — Sat, 6 AM — 10 PM",
    level: "Beginner — Advanced",
    features: ["Treadmills", "Cycling", "Rowing", "Heart Rate Zones"],
  },
  {
    name: "Dance Fitness",
    tagline: "Feel the rhythm.",
    description:
      "High-energy dance workouts that don't feel like exercise. Burn calories while having the time of your life with choreographed routines.",
    image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=700&h=500&fit=crop",
    icon: "💃",
    schedule: "Tue — Thu — Sat, 7 AM — 8 AM",
    level: "All Levels",
    features: ["Choreography", "Full Body Workout", "Music-Driven", "Fun Atmosphere"],
  },
  {
    name: "Boxing",
    tagline: "Unleash the fighter.",
    description:
      "Technical boxing, bag work, and conditioning drills. Build confidence, coordination, and get shredded while learning real boxing technique.",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=700&h=500&fit=crop",
    icon: "🥊",
    schedule: "Mon — Fri, 5 PM — 6 PM",
    level: "Beginner — Intermediate",
    features: ["Bag Work", "Pad Training", "Conditioning", "Technique Drills"],
  },
  {
    name: "Yoga & Flexibility",
    tagline: "Find your balance.",
    description:
      "Restore mobility, reduce stress, and improve flexibility through guided yoga sessions. From beginner flows to advanced power yoga.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&h=500&fit=crop",
    icon: "🧘",
    schedule: "Mon — Wed — Fri, 7 AM — 8 AM",
    level: "All Levels",
    features: ["Vinyasa Flow", "Power Yoga", "Meditation", "Recovery"],
  },
  {
    name: "HIIT Training",
    tagline: "Maximum burn.",
    description:
      "Short bursts of intense exercise with active recovery periods. The most efficient way to burn fat and improve athletic performance.",
    image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=700&h=500&fit=crop",
    icon: "⚡",
    schedule: "Tue — Thu — Sat, 6 PM — 7 PM",
    level: "Intermediate — Advanced",
    features: ["Circuit Training", "Tabata", "MetCon", "Fat Loss"],
  },
];

function TiltCard({
  children,
  className,
  inView = false,
  tiltDirection = 1,
}: {
  children: React.ReactNode;
  className?: string;
  inView?: boolean;
  tiltDirection?: 1 | -1;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [hasGyro, setHasGyro] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const animate = useCallback(() => {
    const lerp = 0.15;
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp;
    setTilt({ x: currentRef.current.x, y: currentRef.current.y });
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  useEffect(() => {
    if (!inView || entranceDone) return;
    const entranceX = 0;
    const entranceY = tiltDirection * 30;
    targetRef.current = { x: entranceX, y: entranceY };
    setShine({ x: tiltDirection === 1 ? 25 : 75, y: 40 });
    const holdTimer = setTimeout(() => {
      targetRef.current = { x: 0, y: 0 };
      setShine({ x: 50, y: 50 });
      const settleTimer = setTimeout(() => setEntranceDone(true), 350);
      return () => clearTimeout(settleTimer);
    }, 200);
    return () => clearTimeout(holdTimer);
  }, [inView, entranceDone, tiltDirection]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!entranceDone) return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetRef.current = { x: (y - 0.5) * -14, y: (x - 0.5) * 14 };
      setShine({ x: x * 100, y: y * 100 });
    },
    [entranceDone]
  );

  const handleMouseEnter = useCallback(() => {
    if (entranceDone) setIsHovered(true);
  }, [entranceDone]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (!entranceDone) return;
    targetRef.current = { x: 0, y: 0 };
    setShine({ x: 50, y: 50 });
  }, [entranceDone]);

  useEffect(() => {
    if (typeof DeviceOrientationEvent === "undefined") return;
    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      if (!hasGyro) setHasGyro(true);
      const x = Math.max(-15, Math.min(15, e.gamma)) / 15;
      const y = Math.max(-15, Math.min(15, e.beta - 45)) / 15;
      targetRef.current = { x: y * -10, y: x * 10 };
      setShine({ x: (x + 1) * 50, y: (y + 1) * 50 });
    };
    window.addEventListener("deviceorientation", handler, { passive: true });
    return () => window.removeEventListener("deviceorientation", handler);
  }, [hasGyro]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ perspective: "800px" }}
    >
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? "scale(1.02)" : "scale(1)"}`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
          style={{
            opacity: isHovered || hasGyro || !entranceDone ? 0.15 : 0,
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.5), transparent 60%)`,
          }}
        />
      </div>
    </div>
  );
}

function ProgramCard({
  program,
  index,
}: {
  program: (typeof programs)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`relative w-full flex flex-col ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      } items-center gap-8 md:gap-16 py-12 md:py-20`}
    >
      {/* Image with 3D tilt */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease, delay: 0.1 }}
        className="w-full md:flex-1"
      >
        <TiltCard inView={inView} tiltDirection={isEven ? 1 : -1} className="aspect-[4/3]">
          <div className="relative h-full w-full">
            <Image
              src={program.image}
              alt={program.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 rounded-2xl border-[3px] border-[#ff6a00] pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(12,12,12,0.6) 0%, transparent 50%)",
            }}
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-[#ff6a00]/20 text-[#ff6a00] font-bold uppercase tracking-wider border border-[#ff6a00]/20">
              {program.level}
            </span>
          </div>
        </TiltCard>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? 40 : -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease, delay: 0.2 }}
        className="w-full md:flex-1 flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{program.icon}</span>
          <h3
            className="text-[clamp(24px,4vw,40px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            {program.name}
          </h3>
        </div>

        <p
          className="text-[clamp(16px,2.5vw,24px)] font-bold uppercase text-[#ff6a00]/70"
          style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
        >
          {program.tagline}
        </p>

        <p
          className="text-[14px] md:text-[15px] text-white/50 leading-relaxed max-w-[480px]"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          {program.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-1">
          {program.features.map((f) => (
            <span
              key={f}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 text-white/40 border border-white/5"
            >
              {f}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2 text-white/30">
          <div className="flex items-center gap-2 text-[13px]">
            <Clock className="h-3.5 w-3.5 text-[#ff6a00]/50" />
            {program.schedule}
          </div>
        </div>

        <WhatsAppModal className="mt-3 inline-flex items-center justify-center gap-2 h-[48px] w-full sm:w-[220px] rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:brightness-110 hover:shadow-lg hover:shadow-[#ff6a00]/25 cursor-pointer">
          START FREE TRIAL
        </WhatsAppModal>
      </motion.div>
    </div>
  );
}

function WhyChooseSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const reasons = [
    {
      icon: Users,
      title: "Expert-Led Classes",
      description:
        "Every program is designed and led by certified fitness professionals with years of experience.",
    },
    {
      icon: Zap,
      title: "State-of-the-Art Equipment",
      description:
        "Latest machines and tools from top brands, regularly maintained for safety and performance.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description:
        "Multiple time slots throughout the day so you can train whenever it fits your schedule.",
    },
  ];

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
            Why Us
          </span>
          <h2
            className="mt-3 text-[clamp(28px,5vw,48px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            WHY CHOOSE <span className="text-[#ff6a00]">OUR PROGRAMS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.1 }}
                className="glass-card rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="h-12 w-12 rounded-xl bg-[#ff6a00]/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="h-6 w-6 text-[#ff6a00]" />
                </div>
                <h3
                  className="text-lg font-bold uppercase text-white"
                  style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                >
                  {reason.title}
                </h3>
                <p
                  className="mt-3 text-[14px] text-white/45 leading-relaxed"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {reason.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative w-full py-16 md:py-24 px-5 md:px-10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,138,0,0.08), transparent 70%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, ease }}
        className="relative mx-auto max-w-[700px] text-center"
      >
        <div className="w-16 h-1 bg-[#ff6a00] rounded-full mx-auto mb-8" />
        <h2
          className="text-[clamp(28px,5vw,52px)] font-black uppercase text-white leading-[0.95]"
          style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
        >
          FIND YOUR <span className="text-[#ff6a00]">PROGRAM</span>
        </h2>
        <p
          className="mt-5 text-[14px] md:text-[17px] text-white/50 max-w-[450px] mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Not sure which program is right for you? Book a free consultation and
          we&apos;ll help you find the perfect fit.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <WhatsAppModal className="inline-flex items-center justify-center gap-2 h-[52px] w-full sm:w-[240px] rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-1 hover:brightness-110 hover:shadow-xl hover:shadow-[#ff6a00]/25 cursor-pointer">
            START FREE TRIAL <ArrowRight className="h-4 w-4" />
          </WhatsAppModal>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center h-[52px] w-full sm:w-[240px] rounded-xl border-2 border-white/15 text-sm font-bold uppercase tracking-wide text-white/70 transition-all duration-200 hover:bg-white/5 hover:border-white/25 hover:text-white"
          >
            VIEW PRICING
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default function ProgramsClient() {
  return (
    <>
      <MarketingHero
        title="OUR"
        highlight="PROGRAMS"
        subtitle="Something for every goal, every fitness level. Explore our diverse range of training programs."
      />
      <div className="px-5 md:px-10 mx-auto max-w-[1400px]">
        {programs.map((program, i) => (
          <ProgramCard key={program.name} program={program} index={i} />
        ))}
      </div>
      <WhyChooseSection />
      <CTASection />
    </>
  );
}
