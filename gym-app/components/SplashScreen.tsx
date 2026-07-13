"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "done">("show");

  useEffect(() => {
    const showTimer = setTimeout(() => setPhase("fade"), 1500);
    const fadeTimer = setTimeout(() => setPhase("done"), 2000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080E1A] transition-opacity duration-500 ease-out"
      style={{ opacity: phase === "fade" ? 0 : 1 }}
    >
      <Image
        src="/logo/logo.png"
        alt="Gym Manager"
        width={180}
        height={62}
        priority
        className="mb-4 h-auto w-44 md:w-56"
      />
      <div className="mt-6 flex gap-1.5">
        <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
      </div>
    </div>
  );
}
