"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import MarketingHero from "./MarketingHero";
import WhatsAppModal from "@/components/WhatsAppModal";

const ease = [0.23, 1, 0.32, 1] as const;

const specialties = [
  "All",
  "Strength",
  "Cardio",
  "Yoga",
  "Boxing",
  "Nutrition",
  "Dance",
];

const trainers = [
  {
    name: "Rajesh Rajoria",
    role: "Founder & Head Trainer",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&h=600&fit=crop&crop=faces",
    specialty: "Strength",
    experience: "12+ years",
    certifications: ["NSCA-CSCS", "ACE CPT"],
    bio: "Passionate about helping people discover their strength potential. Specializes in powerlifting and body transformation.",
    instagram: "#",
  },
  {
    name: "Priya Sharma",
    role: "Yoga & Wellness Coach",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&h=600&fit=crop&crop=faces",
    specialty: "Yoga",
    experience: "8+ years",
    certifications: ["RYT-500", "YACEP"],
    bio: "Dedicated to helping others find balance through yoga. Combines traditional practice with modern fitness science.",
    instagram: "#",
  },
  {
    name: "Amit Verma",
    role: "Cardio & HIIT Specialist",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&h=600&fit=crop&crop=faces",
    specialty: "Cardio",
    experience: "6+ years",
    certifications: ["ACE CPT", "CrossFit L2"],
    bio: "High-energy trainer who believes in pushing limits. Expert in fat loss and athletic performance.",
    instagram: "#",
  },
  {
    name: "Sneha Patel",
    role: "Nutrition & Diet Expert",
    image: "https://images.unsplash.com/photo-1609899517237-328ffa28e614?w=500&h=600&fit=crop&crop=faces",
    specialty: "Nutrition",
    experience: "10+ years",
    certifications: ["ISSN", "Certified Dietician"],
    bio: "Believes nutrition is the foundation of fitness. Creates personalized meal plans for optimal results.",
    instagram: "#",
  },
  {
    name: "Vikram Singh",
    role: "Boxing & MMA Coach",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&h=600&fit=crop&crop=faces&sat=-100",
    specialty: "Boxing",
    experience: "9+ years",
    certifications: ["AIKYA Boxing Level 3", "K1 Kickboxing"],
    bio: "Former competitive boxer turned coach. Teaches technique, discipline, and the mental game of combat sports.",
    instagram: "#",
  },
  {
    name: "Ananya Reddy",
    role: "Dance Fitness Instructor",
    image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500&h=600&fit=crop&crop=faces",
    specialty: "Dance",
    experience: "7+ years",
    certifications: ["Zumba B1", "AFAA Group Fitness"],
    bio: "Makes fitness feel like a party. Specializes in Zumba, Bollywood dance, and rhythm-based workouts.",
    instagram: "#",
  },
  {
    name: "Karan Malhotra",
    role: "Strength & Conditioning",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=600&fit=crop&crop=faces",
    specialty: "Strength",
    experience: "11+ years",
    certifications: ["NSCA-CSCS", "USAW L1"],
    bio: "Sports performance specialist. Works with athletes and fitness enthusiasts to build functional strength.",
    instagram: "#",
  },
  {
    name: "Meera Joshi",
    role: "Yoga & Meditation Guide",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=600&fit=crop&crop=faces",
    specialty: "Yoga",
    experience: "5+ years",
    certifications: ["RYT-200", "MBSR Certified"],
    bio: "Focuses on the mind-body connection. Combines yoga with breathwork and meditation for holistic wellness.",
    instagram: "#",
  },
];

function TrainerCard({
  trainer,
  index,
}: {
  trainer: (typeof trainers)[number];
  index: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ duration: 0.5, ease, delay: index * 0.06 }}
      whileHover={{ y: -6, transition: { duration: 0.3, ease } }}
      className="group glass-card rounded-2xl overflow-hidden"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={trainer.image}
          alt={trainer.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Specialty badge */}
        <div className="absolute top-4 right-4">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#ff6a00]/20 text-[#ff6a00] font-bold uppercase tracking-wider border border-[#ff6a00]/20 backdrop-blur-sm">
            {trainer.specialty}
          </span>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3
            className="text-xl font-bold text-white"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            {trainer.name}
          </h3>
          <p className="text-[13px] text-[#ff6a00] font-medium mt-1">
            {trainer.role}
          </p>
          <p
            className="mt-2 text-[12px] text-white/40 leading-relaxed line-clamp-2"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {trainer.bio}
          </p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-white/25" />
              <span className="text-[11px] text-white/30">{trainer.experience}</span>
            </div>
            <a
              href={trainer.instagram}
              aria-label={`${trainer.name} Instagram`}
              className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/25 transition-all duration-200 hover:bg-[#ff6a00]/10 hover:border-[#ff6a00]/20 hover:text-[#ff6a00]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="px-5 pb-4 pt-2 flex flex-wrap gap-1.5">
        {trainer.certifications.map((cert) => (
          <span
            key={cert}
            className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30 border border-white/5"
          >
            {cert}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function TrainersClient() {
  const [activeFilter, setActiveFilter] = useState("All");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const filtered =
    activeFilter === "All"
      ? trainers
      : trainers.filter((t) => t.specialty === activeFilter);

  return (
    <>
      <MarketingHero
        title="OUR"
        highlight="TRAINERS"
        subtitle="Certified professionals dedicated to helping you achieve real results. Find your perfect coach."
      />

      <section ref={ref} className="relative w-full py-12 md:py-20 px-5 md:px-10">
        <div className="mx-auto max-w-[1200px]">
          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
            className="flex flex-wrap items-center justify-center gap-2 mb-10 md:mb-14"
          >
            {specialties.map((s) => (
              <button
                key={s}
                onClick={() => setActiveFilter(s)}
                className={`h-9 px-4 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeFilter === s
                    ? "bg-[#ff6a00] text-white shadow-lg shadow-[#ff6a00]/20"
                    : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60"
                }`}
                style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
              >
                {s}
              </button>
            ))}
          </motion.div>

          {/* Trainer grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((trainer, i) => (
                <TrainerCard key={trainer.name} trainer={trainer} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative w-full py-16 md:py-24 px-5 md:px-10">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,138,0,0.08), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[700px] text-center">
          <div className="w-16 h-1 bg-[#ff6a00] rounded-full mx-auto mb-8" />
          <h2
            className="text-[clamp(28px,5vw,52px)] font-black uppercase text-white leading-[0.95]"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            TRAIN WITH THE <span className="text-[#ff6a00]">BEST</span>
          </h2>
          <p
            className="mt-5 text-[14px] md:text-[17px] text-white/50 max-w-[450px] mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Book a free session with any of our trainers and experience the
            difference expert guidance makes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <WhatsAppModal className="inline-flex items-center justify-center gap-2 h-[52px] w-full sm:w-[240px] rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-1 hover:brightness-110 hover:shadow-xl hover:shadow-[#ff6a00]/25 cursor-pointer">
              START FREE TRIAL <ArrowRight className="h-4 w-4" />
            </WhatsAppModal>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-[52px] w-full sm:w-[240px] rounded-xl border-2 border-white/15 text-sm font-bold uppercase tracking-wide text-white/70 transition-all duration-200 hover:bg-white/5 hover:border-white/25 hover:text-white"
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
