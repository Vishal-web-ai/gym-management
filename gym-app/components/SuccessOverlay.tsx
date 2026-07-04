"use client";

import { useEffect, useState } from "react";

export default function SuccessOverlay({
  title,
  onDone,
}: {
  title: string;
  onDone: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  if (!show) return null;

  const particles = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const angle = (i * Math.PI) / 4;
    const dx = Math.round(Math.cos(angle) * 120);
    const dy = Math.round(Math.sin(angle) * 120);
    return { dx, dy, color: ["#22C55E","#3B82F6","#A855F7","#EC4899","#F59E0B","#14B8A6","#F97316","#8B5CF6"][i] };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="flash-overlay absolute inset-0" />
          {particles.map((p, i) => (
            <div
              key={i}
              className="energy-particle absolute size-2.5 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                marginTop: -5,
                marginLeft: -5,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                backgroundColor: p.color,
                animationDelay: `${i * 0.04}s`,
              } as React.CSSProperties}
            />
          ))}
          <div className="ring-wave absolute" />
          <div className="ring-wave absolute" style={{ animationDelay: "0.15s" }} />
          <div className="tick-circle absolute flex items-center justify-center">
            <svg
              className="tick-svg size-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <p className="success-text text-xl font-bold text-white">{title}</p>
        <button
          onClick={onDone}
          className="mt-2 cursor-pointer rounded-xl border border-white/20 bg-white/15 px-8 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25"
        >
          Done
        </button>
      </div>

      <style>{`
        .flash-overlay {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
          animation: flash-burst 0.6s ease-out 0.35s both;
        }
        .energy-particle {
          position: absolute;
          border-radius: 50%;
          box-shadow: 0 0 6px 2px currentColor;
          animation: energy-fly-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .ring-wave {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid rgba(34, 197, 94, 0.6);
          animation: ring-expand 0.8s ease-out 0.7s both;
        }
        .tick-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #16A34A, #22C55E);
          box-shadow: 0 0 40px rgba(22, 163, 74, 0.5), 0 0 80px rgba(22, 163, 74, 0.2);
          animation: tick-reveal 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s both;
        }
        .tick-svg {
          animation: tick-draw 0.5s ease-out 1.1s both;
        }
        .success-text {
          animation: text-appear 0.5s ease-out 1.3s both;
        }
        @keyframes energy-fly-in {
          0% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
          50% { transform: translate(calc(var(--dx) * 0.1), calc(var(--dy) * 0.1)) scale(1.4); opacity: 1; }
          100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        @keyframes flash-burst {
          0% { opacity: 0; transform: scale(0); }
          30% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 0; transform: scale(3); }
        }
        @keyframes ring-expand {
          0% { transform: scale(0.5); opacity: 0; }
          30% { opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes tick-reveal {
          0% { transform: scale(0) rotate(-90deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(10deg); opacity: 1; }
          70% { transform: scale(0.95) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes tick-draw {
          0% { stroke-dashoffset: 30; stroke-dasharray: 30; opacity: 0; }
          100% { stroke-dashoffset: 0; stroke-dasharray: 30; opacity: 1; }
        }
        @keyframes text-appear {
          0% { opacity: 0; transform: translateY(15px) scale(0.85); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
