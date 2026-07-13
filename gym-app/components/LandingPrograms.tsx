"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useAnimation } from "motion/react";
import Image from "next/image";
import WhatsAppModal from "@/components/WhatsAppModal";

const ease = [0.23, 1, 0.32, 1] as const;

/* ── Program data ── */

const programs = [
  {
    name: "DANCE FITNESS",
    tagline: "Feel the rhythm.",
    description:
      "High-energy dance workouts that don't feel like exercise. Burn calories while having the time of your life.",
    images: ["/programs/yoga-room-1.jpg", "/programs/yoga-room-2.jpg", "/programs/yoga-room-1.jpg"],
    icon: "\uD83D\uDC83",
  },
  {
    name: "CARDIO TRAINING",
    tagline: "Push your limits.",
    description:
      "Treadmills, cycles, rowing \u2014 heart-pumping sessions that build endurance and torch calories.",
    images: ["/programs/cardio-1.jpg", "/programs/cardio-2.jpg", "/programs/cardio-3.jpg"],
    icon: "\uD83C\uDFC3",
  },
  {
    name: "WEIGHT TRAINING",
    tagline: "Build your strength.",
    description:
      "Free weights, machines, and guided hypertrophy programs. Shape the body you've always wanted.",
    images: ["/programs/strength-1.jpg", "/programs/strength-2.jpg", "/programs/strength-3.jpg"],
    icon: "\uD83C\uDFCB\uFE0F",
  },
  {
    name: "BOXING",
    tagline: "Unleash the fighter.",
    description:
      "Technical boxing, bag work, and conditioning drills. Build confidence while getting shredded.",
    images: ["/programs/boxing.jpg", "/programs/boxing.jpg", "/programs/boxing.jpg"],
    icon: "\uD83E\uDD4A",
  },
];

/* ── 3D Tilt Card ── */

function TiltCard({
  children,
  className,
  inView = false,
  tiltDirection = 1,
  tiltAngle = 30,
  disableGyro = false,
  resetKey,
}: {
  children: React.ReactNode;
  className?: string;
  inView?: boolean;
  tiltDirection?: 1 | -1;
  tiltAngle?: number;
  disableGyro?: boolean;
  resetKey?: string | number;
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

  // ── Reset entrance when resetKey changes ──
  useEffect(() => {
    if (resetKey === undefined) return;
    setEntranceDone(false);
    const startY = -tiltDirection * tiltAngle;
    currentRef.current = { x: 0, y: startY };
    targetRef.current = { x: 0, y: startY };
    setTilt({ x: 0, y: startY });
  }, [resetKey]);

  // ── Scroll-triggered entrance tilt ──
  useEffect(() => {
    if (!inView || entranceDone) return;
    const entranceX = 0;
    const entranceY = tiltDirection * tiltAngle;
    targetRef.current = { x: entranceX, y: entranceY };
    setShine({ x: tiltDirection === 1 ? 25 : 75, y: 40 });

    const holdTimer = setTimeout(() => {
      setEntranceDone(true);
    }, 200);
    return () => clearTimeout(holdTimer);
  }, [inView, entranceDone, tiltDirection]);

  // ── Mouse hover (only after entrance completes) ──
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
    targetRef.current = { x: 0, y: tiltDirection * tiltAngle };
    setShine({ x: tiltDirection === 1 ? 25 : 75, y: 40 });
  }, [entranceDone, tiltDirection, tiltAngle]);

  // ── Gyroscope (mobile, unless disabled) ──
  useEffect(() => {
    if (disableGyro || typeof DeviceOrientationEvent === "undefined") return;
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
  }, [hasGyro, disableGyro]);

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
        className="relative w-full h-full rounded-2xl overflow-hidden"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? "scale(1.02)" : "scale(1)"}`,
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out",
        }}
      >
        {children}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            opacity: isHovered || hasGyro || !entranceDone ? 0.18 : 0,
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.6), transparent 55%)`,
            transition: "opacity 0.3s",
          }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   DESKTOP — full-viewport sections
   ══════════════════════════════════════ */

function ImageCarousel({
  images,
  isActive,
  landscape,
  current,
  setCurrent,
  inView = false,
  tiltDirection = 1 as 1 | -1,
  tiltAngle = 30,
  disableGyro = false,
  resetKey,
  showControls = true,
}: {
  images: string[];
  isActive: boolean;
  landscape?: boolean;
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  inView?: boolean;
  tiltDirection?: 1 | -1;
  tiltAngle?: number;
  disableGyro?: boolean;
  resetKey?: string | number;
  showControls?: boolean;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isActive || isPaused || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isActive, isPaused, images.length, setCurrent]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setIsPaused(true);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      if (Math.abs(dx) > 50) {
        if (dx < 0 && current < images.length - 1) {
          setCurrent((p) => p + 1);
        } else if (dx > 0 && current > 0) {
          setCurrent((p) => p - 1);
        }
      }
      touchStart.current = null;
      setIsPaused(false);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [current, images.length, setCurrent]);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center gap-3 md:gap-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <TiltCard
        inView={inView}
        tiltDirection={tiltDirection}
        tiltAngle={tiltAngle}
        disableGyro={disableGyro}
        resetKey={resetKey}
        className={`w-full ${
          landscape
            ? "aspect-[16/10] max-w-full"
            : "max-w-[320px] md:max-w-[380px] aspect-[3/4]"
        }`}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full rounded-2xl overflow-hidden group"
          style={{ touchAction: "pan-y" }}
        >
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="absolute inset-0 transition-opacity duration-700 ease-out"
              style={{ opacity: i === current ? 1 : 0 }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 320px, 380px"
                className="object-cover"
                draggable={false}
              />
            </div>
          ))}
          <div className="absolute inset-0 rounded-2xl border-[3px] border-[#ff6a00] pointer-events-none" />
        </div>
      </TiltCard>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Image ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-400 ${
                i === current ? "w-6 bg-[#ff6a00]" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DesktopProgramSection({
  program,
  index,
  sectionRefs,
}: {
  program: (typeof programs)[number];
  index: number;
  sectionRefs: React.RefObject<(HTMLElement | null)[]>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-20%" });
  const isEven = index % 2 === 0;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (sectionRefs.current) {
      sectionRefs.current[index] = sectionRef.current;
    }
  }, [index, sectionRefs]);

  const scrollToProgram = (i: number) => {
    sectionRefs.current?.[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full hidden md:flex items-center overflow-hidden md:snap-start"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isEven
            ? "radial-gradient(ellipse 40% 50% at 15% 50%, rgba(255,106,0,0.03), transparent 70%)"
            : "radial-gradient(ellipse 40% 50% at 85% 50%, rgba(255,106,0,0.03), transparent 70%)",
        }}
      />
      <div
        className={`relative mx-auto w-full max-w-[1400px] px-5 md:px-10 flex ${
          isEven ? "flex-row" : "flex-row-reverse"
        } items-center gap-8 md:gap-16`}
      >
        <motion.div
          initial={{ opacity: 0, x: isEven ? -48 : 48 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="flex-1 flex flex-col items-start text-left gap-4 md:gap-5"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6a00]/50" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
            0{index + 1} / 04
          </span>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{program.icon}</span>
            <h2 className="text-[clamp(28px,5vw,52px)] font-black uppercase text-white leading-[0.95]" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
              {program.name}
            </h2>
          </div>
          <p className="text-[clamp(18px,3vw,28px)] font-bold uppercase text-[#ff6a00]/70" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
            {program.tagline}
          </p>
          <p className="text-[16px] text-white/50 max-w-[400px] leading-relaxed" style={{ fontFamily: "var(--font-jetbrains)" }}>
            {program.description}
          </p>
          <WhatsAppModal className="mt-2 inline-flex items-center justify-center h-[48px] px-8 rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:brightness-110 hover:shadow-lg hover:shadow-[#ff6a00]/25 cursor-pointer">
            START FREE TRIAL
          </WhatsAppModal>
          <div className="flex items-center gap-3 mt-2">
            {programs.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToProgram(i)}
                aria-label={programs[i].name}
                className={`h-2 rounded-full transition-all duration-400 ${
                  i === index ? "w-6 bg-[#ff6a00]" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: isEven ? 48 : -48, scale: 0.95 }}
          animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.25 }}
          className="flex-1 flex items-center justify-center"
        >
          <ImageCarousel
            images={program.images}
            isActive={inView}
            current={current}
            setCurrent={setCurrent}
            inView={inView}
            tiltDirection={isEven ? 1 : -1}
          />
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}

/* ══════════════════════════════════════
   MOBILE — swipe between programs
   ══════════════════════════════════════ */

function MobilePrograms() {
  const [activeProgram, setActiveProgram] = useState(0);
  const [displayedProgram, setDisplayedProgram] = useState(0);
  const [direction, setDirection] = useState(0);
  const [current, setCurrent] = useState(0);
  const controls = useAnimation();
  const isAnimating = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-10%" });

  const goTo = async (next: number) => {
    if (isAnimating.current || next === displayedProgram) return;
    isAnimating.current = true;
    const dir = next > displayedProgram ? 1 : -1;
    setDirection(dir);

    await controls.start({
      opacity: 0,
      x: dir > 0 ? -60 : 60,
      transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
    });

    setDisplayedProgram(next);
    setActiveProgram(next);
    setCurrent(0);

    await controls.set({ x: dir > 0 ? 60 : -60, opacity: 0 });
    await controls.start({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
    });

    isAnimating.current = false;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      if (Math.abs(dx) > 60) {
        if (dx < 0 && displayedProgram < programs.length - 1) {
          goTo(displayedProgram + 1);
        } else if (dx > 0 && displayedProgram > 0) {
          goTo(displayedProgram - 1);
        }
      }
      touchStart.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [displayedProgram]);

  const program = programs[displayedProgram];

  return (
    <section ref={sectionRef} className="relative md:hidden w-full overflow-hidden">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease }}
        className="text-center pt-16 pb-6 px-5"
      >
        <h2 className="text-[clamp(28px,7vw,40px)] font-black uppercase text-white leading-tight" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
          OUR <span className="text-[#ff6a00]">PROGRAMS</span>
        </h2>
        <p className="mt-2 text-[13px] text-white/40" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Swipe to explore
        </p>
      </motion.div>

      {/* Swipeable program card */}
      <div ref={containerRef} className="px-5 pb-16" style={{ touchAction: "pan-y" }}>
        <motion.div
          animate={controls}
          className="flex flex-col gap-4"
        >
          {/* Image carousel — landscape on mobile */}
          <ImageCarousel
            images={program.images}
            isActive={inView}
            landscape
            current={current}
            setCurrent={setCurrent}
            inView={inView}
            tiltDirection={displayedProgram % 2 === 0 ? 1 : -1}
            tiltAngle={30}
            disableGyro
            resetKey={displayedProgram}
            showControls={false}
          />

          {/* Text below image */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => goTo(displayedProgram > 0 ? displayedProgram - 1 : programs.length - 1)}
                aria-label="Previous program"
                className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 transition-all duration-300 hover:bg-black/50 hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <span className="text-2xl">{program.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff6a00]/50" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
                0{displayedProgram + 1} / 04
              </span>
              <button
                onClick={() => goTo(displayedProgram < programs.length - 1 ? displayedProgram + 1 : 0)}
                aria-label="Next program"
                className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 transition-all duration-300 hover:bg-black/50 hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
            <h3 className="text-[24px] font-black uppercase text-white leading-tight" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
              {program.name}
            </h3>
            <p className="text-[16px] font-bold uppercase text-[#ff6a00]/70" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
              {program.tagline}
            </p>
            <p className="text-[13px] text-white/45 leading-relaxed max-w-[340px]" style={{ fontFamily: "var(--font-jetbrains)" }}>
              {program.description}
            </p>
            <WhatsAppModal className="mt-2 inline-flex items-center justify-center h-[44px] w-full max-w-[280px] rounded-xl bg-[#ff6a00] text-xs font-bold uppercase tracking-wide text-white cursor-pointer">
              START FREE TRIAL
            </WhatsAppModal>
            <div className="flex items-center gap-3 mt-2">
              {programs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={programs[i].name}
                  className={`h-2 rounded-full transition-all duration-400 ${
                    i === displayedProgram ? "w-6 bg-[#ff6a00]" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */

export default function LandingPrograms() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  return (
    <div ref={wrapperRef} className="relative w-full -mt-16 md:-mt-24 md:snap-y md:snap-mandatory">
      {/* Mobile view */}
      <MobilePrograms />

      {/* Desktop header */}
      <HeaderSection />

      {/* Desktop program sections */}
      {programs.map((program, i) => (
        <DesktopProgramSection
          key={program.name}
          program={program}
          index={i}
          sectionRefs={sectionRefs}
        />
      ))}



    </div>
  );
}

/* ── Desktop header section ── */

function HeaderSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section
      ref={ref}
      className="relative h-screen w-full hidden md:flex items-center justify-center overflow-hidden md:snap-start"
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,106,0,0.05), transparent 70%)" }} />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease }}
        className="text-center px-5"
      >
        <h2 className="text-[clamp(36px,7vw,72px)] font-black uppercase text-white leading-[0.95]" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
          OUR <span className="text-[#ff6a00]">PROGRAMS</span>
        </h2>
        <p className="mt-4 text-[14px] md:text-[18px] text-white/40 max-w-[450px] mx-auto" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Something for every goal, every fitness level. Scroll to explore.
        </p>
      </motion.div>
    </section>
  );
}
