"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Star, Quote } from "lucide-react";

const ease = [0.23, 1, 0.32, 1] as const;

/* ── Replace these with your real Google Reviews ── */

const reviews = [
  {
    name: "Rahul Sharma",
    rating: 5,
    text: "Best gym in the area! The trainers are super supportive and the equipment is top-notch. I've lost 12kg in 3 months.",
    date: "2 weeks ago",
  },
  {
    name: "Priya Patel",
    rating: 5,
    text: "Amazing atmosphere and clean facilities. The group classes are electric. Highly recommend for anyone serious about fitness.",
    date: "1 month ago",
  },
  {
    name: "Amit Kumar",
    rating: 5,
    text: "I've tried many gyms but this one is different. Personalized training plans and the staff genuinely cares about your progress.",
    date: "3 weeks ago",
  },
  {
    name: "Sneha Reddy",
    rating: 5,
    text: "The app makes it so easy to track my workouts and payments. Love the convenience of checking in with my phone.",
    date: "1 week ago",
  },
  {
    name: "Vikram Singh",
    rating: 5,
    text: "Great gym with excellent trainers. The equipment is always well-maintained and the vibe is incredible. Worth every rupee.",
    date: "2 months ago",
  },
  {
    name: "Ananya Gupta",
    rating: 4,
    text: "Really enjoying my experience here. The personal training sessions are fantastic. Just wish they had slightly longer weekend hours.",
    date: "5 days ago",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-[#ff6a00] text-[#ff6a00]"
              : "fill-white/10 text-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ── Single review card (reused in marquee) ── */

function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 w-[320px] md:w-[380px] shrink-0 group hover:border-[#ff6a00]/15">
      <div className="flex items-start justify-between">
        <StarRating rating={review.rating} />
        <Quote className="h-4 w-4 text-[#ff6a00]/20 group-hover:text-[#ff6a00]/50 transition-colors" />
      </div>

      <p className="text-[13px] md:text-[14px] text-white/65 leading-relaxed flex-1">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#ff6a00]/15 flex items-center justify-center text-[#ff6a00] font-bold text-xs" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
            {review.name.charAt(0)}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white">{review.name}</div>
            <div className="text-[11px] text-white/30">{review.date}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/20">
          <GoogleIcon />
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */

export default function LandingSocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="testimonials"
      className="relative w-full py-12 md:py-16 overflow-hidden"
    >
      {/* Background glow — amber */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,138,0,0.06), transparent 70%)",
        }}
      />

      <div className="relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-8 md:mb-12 px-5"
        >
          <h2
            className="text-[clamp(28px,5vw,48px)] font-black uppercase text-white leading-tight"
            style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
          >
            WHAT OUR{" "}
            <span className="text-[#ff6a00]">MEMBERS</span> SAY
          </h2>
          <p
            className="mt-3 text-[14px] md:text-[16px] text-white/50 max-w-[500px] mx-auto"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Real reviews from real members who transformed their lives with us
          </p>
        </motion.div>

        {/* Google rating badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-10 md:mb-14"
        >
          <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2.5">
            <GoogleIcon />
            <span className="text-white font-bold text-lg" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
              4.9
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#ff6a00] text-[#ff6a00]" />
              ))}
            </div>
            <span className="text-white/40 text-sm">on Google</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 max-w-[600px] mx-auto mb-12 md:mb-16 px-5"
        >
          {[
            { value: "500+", label: "Happy Members" },
            { value: "4.9", label: "Google Rating" },
            { value: "200+", label: "5-Star Reviews" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-[#ff6a00]" style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}>
                {stat.value}
              </div>
              <div className="text-[11px] md:text-xs text-white/40 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Infinite marquee ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, ease, delay: 0.4 }}
          className="marquee-wrapper"
        >
          <div className="marquee-track">
            {/* First set */}
            {reviews.map((review) => (
              <ReviewCard key={review.name} review={review} />
            ))}
            {/* Duplicate set for seamless loop */}
            {reviews.map((review) => (
              <ReviewCard key={`dup-${review.name}`} review={review} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Marquee styles ── */}
      <style>{`
        .marquee-wrapper {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 5%,
            black 95%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 5%,
            black 95%,
            transparent 100%
          );
        }

        .marquee-track {
          display: flex;
          gap: 1rem;
          width: max-content;
          animation: marquee-scroll 30s linear infinite;
        }

        .marquee-wrapper:hover .marquee-track {
          animation-play-state: paused;
        }

        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
