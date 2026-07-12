"use client";

import { useEffect, useRef } from "react";

const PARTICLES = Array.from({ length: 35 }, (_, i) => ({
  left: `${(i * 3.1 + 1) % 100}%`,
  size: 1.5 + (i % 4) * 0.7,
  dur: 10 + (i % 6) * 2.5,
  delay: (i * 1.3) % 12,
  blur: i % 3 === 0 ? 1 : 0,
}));

export default function FloatingParticles() {
  const ref = useRef<HTMLDivElement>(null);

  // Parallax: particles move slower than scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = el.parentElement?.scrollTop ?? 0;
          el.style.transform = `translateY(${scrollY * -0.15}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    const parent = el.parentElement;
    parent?.addEventListener("scroll", onScroll, { passive: true });
    return () => parent?.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            background: "rgba(255,138,0,0.5)",
            boxShadow: `0 0 ${p.size * 4}px ${p.size}px rgba(255,138,0,0.2)`,
            filter: `blur(${p.blur}px)`,
            animation: `ember-rise ${p.dur}s ease-in infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0,
          }}
        />
      ))}

    </div>
  );
}
