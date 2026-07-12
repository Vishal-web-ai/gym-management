"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Target,
  Heart,
  Shield,
  Flame,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import MarketingHero from "./MarketingHero";
import WhatsAppModal from "@/components/WhatsAppModal";

const ease = [0.23, 1, 0.32, 1] as const;

const stats = [
  { value: "8+", label: "Years of Excellence" },
  { value: "500+", label: "Active Members" },
  { value: "25+", label: "Expert Trainers" },
  { value: "4.9", label: "Google Rating" },
];

const values = [
  {
    icon: Target,
    title: "Results-Driven",
    description:
      "Every program, every session, every rep is designed to move you closer to your goals.",
  },
  {
    icon: Heart,
    title: "Community First",
    description:
      "We're more than a gym — we're a family. Your success is our success.",
  },
  {
    icon: Shield,
    title: "Safety & Quality",
    description:
      "World-class equipment maintained to the highest standards with expert supervision.",
  },
  {
    icon: Flame,
    title: "Relentless Energy",
    description:
      "An atmosphere that pushes you to break limits and discover what you're truly capable of.",
  },
];

const team = [
  {
    name: "Rajesh Rajoria",
    role: "Founder & Head Trainer",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop&crop=faces",
    specialties: ["Strength Training", "Body Transformation"],
  },
  {
    name: "Priya Sharma",
    role: "Yoga & Wellness Coach",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop&crop=faces",
    specialties: ["Yoga", "Meditation", "Flexibility"],
  },
  {
    name: "Amit Verma",
    role: "Cardio & HIIT Specialist",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop&crop=faces",
    specialties: ["HIIT", "Cardio", "Fat Loss"],
  },
  {
    name: "Sneha Patel",
    role: "Nutrition & Diet Expert",
    image: "https://images.unsplash.com/photo-1609899517237-328ffa28e614?w=400&h=500&fit=crop&crop=faces",
    specialties: ["Nutrition", "Meal Planning", "Supplements"],
  },
];

const gallery = [
  { src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop", alt: "Gym floor with equipment" },
  { src: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=400&fit=crop", alt: "Training area" },
  { src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop", alt: "Weight section" },
  { src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop", alt: "Group class" },
  { src: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop", alt: "Cardio zone" },
  { src: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&h=400&fit=crop", alt: "Free weights area" },
];

function SectionDivider() {
  return (
    <div className="relative w-full h-px max-w-[1200px] mx-auto">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,138,0,0.15) 20%, rgba(255,138,0,0.25) 50%, rgba(255,138,0,0.15) 80%, transparent 100%)",
        }}
      />
    </div>
  );
}

function StorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative w-full py-16 md:py-24 px-5 md:px-10">
      <div className="mx-auto max-w-[1000px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-12 md:mb-16"
        >
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6a00]/50"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            Our Story
          </span>
          <h2
            className="mt-3 text-[clamp(28px,5vw,48px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            BORN FROM <span className="text-[#ff6a00]">PASSION</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
            className="relative rounded-2xl overflow-hidden aspect-[4/3]"
          >
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop"
              alt="Rajoria Fitness gym floor"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.25 }}
            className="flex flex-col gap-5"
          >
            <p
              className="text-[15px] md:text-[17px] text-white/60 leading-relaxed"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Rajoria Fitness was founded in 2017 with a simple mission: create
              a space where anyone — regardless of fitness level — can walk in
              and feel empowered to become their best self.
            </p>
            <p
              className="text-[15px] md:text-[17px] text-white/60 leading-relaxed"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              What started as a small training studio has grown into a
              full-service fitness center with state-of-the-art equipment, expert
              trainers, and a community of over 500 dedicated members.
            </p>
            <p
              className="text-[15px] md:text-[17px] text-white/60 leading-relaxed"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              We believe fitness is not just about physical strength — it&apos;s
              about building discipline, confidence, and a lifestyle that
              transforms every aspect of your life.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative w-full py-12 md:py-16 px-5 md:px-10">
      <div className="mx-auto max-w-[1000px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.1 }}
              className="text-center"
            >
              <span
                className="text-[clamp(32px,5vw,56px)] font-black text-[#ff6a00] leading-none"
                style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
              >
                {stat.value}
              </span>
              <p
                className="mt-2 text-[12px] md:text-[13px] uppercase tracking-wider text-white/40"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
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
            Our Values
          </span>
          <h2
            className="mt-3 text-[clamp(28px,5vw,48px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            WHAT WE <span className="text-[#ff6a00]">STAND FOR</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.1 }}
                className="glass-card rounded-2xl p-6 md:p-8 flex gap-5"
              >
                <div className="h-12 w-12 rounded-xl bg-[#ff6a00]/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-[#ff6a00]" />
                </div>
                <div>
                  <h3
                    className="text-lg font-bold uppercase text-white"
                    style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                  >
                    {value.title}
                  </h3>
                  <p
                    className="mt-2 text-[14px] text-white/45 leading-relaxed"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {value.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
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
            Our Team
          </span>
          <h2
            className="mt-3 text-[clamp(28px,5vw,48px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            MEET THE <span className="text-[#ff6a00]">EXPERTS</span>
          </h2>
          <p
            className="mt-3 text-[14px] text-white/40 max-w-[450px] mx-auto"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Certified professionals dedicated to helping you achieve results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.3, ease } }}
              className="group glass-card rounded-2xl overflow-hidden"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
                  >
                    {member.name}
                  </h3>
                  <p className="text-[13px] text-[#ff6a00] font-medium mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>
              <div className="p-4 flex flex-wrap gap-1.5">
                {member.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <Link
            href="/trainers"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#ff6a00] hover:text-[#ff8533] transition-colors"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            View All Trainers <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function GallerySection() {
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
            Our Facility
          </span>
          <h2
            className="mt-3 text-[clamp(28px,5vw,48px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            THE <span className="text-[#ff6a00]">SPACE</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {gallery.map((img, i) => (
            <motion.div
              key={img.alt}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.08 }}
              className="relative rounded-2xl overflow-hidden aspect-[3/2] group"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-2xl" />
            </motion.div>
          ))}
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
          READY TO <span className="text-[#ff6a00]">JOIN US</span>?
        </h2>
        <p
          className="mt-5 text-[14px] md:text-[17px] text-white/50 max-w-[450px] mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Start your free trial today. No credit card required. Cancel anytime.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <WhatsAppModal className="inline-flex items-center justify-center h-[52px] w-full sm:w-[240px] rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-1 hover:brightness-110 hover:shadow-xl hover:shadow-[#ff6a00]/25 cursor-pointer">
            START FREE TRIAL
          </WhatsAppModal>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center h-[52px] w-full sm:w-[240px] rounded-xl border-2 border-white/15 text-sm font-bold uppercase tracking-wide text-white/70 transition-all duration-200 hover:bg-white/5 hover:border-white/25 hover:text-white"
          >
            CONTACT US
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default function AboutClient() {
  return (
    <>
      <MarketingHero
        title="ABOUT"
        highlight="RAJORIA FITNESS"
        subtitle="More than a gym — a community built on passion, discipline, and the relentless pursuit of excellence."
      />
      <StorySection />
      <SectionDivider />
      <StatsSection />
      <SectionDivider />
      <ValuesSection />
      <SectionDivider />
      <TeamSection />
      <SectionDivider />
      <GallerySection />
      <SectionDivider />
      <CTASection />
    </>
  );
}
