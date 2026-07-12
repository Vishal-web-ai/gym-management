"use client";

import FloatingParticles from "@/components/FloatingParticles";

export default function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FloatingParticles />
      {children}
    </>
  );
}
