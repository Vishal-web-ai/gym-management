"use client";

import { type ReactNode } from "react";
import { StaggerContainer, StaggerItem, AnimatedCard } from "@/components/animations";

export function StatCardsWrapper({ children }: { children: ReactNode }) {
  return (
    <StaggerContainer staggerDelay={0.08} delayFirst={0.15}>
      {children}
    </StaggerContainer>
  );
}

export function StatCardItem({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return <StaggerItem>{children}</StaggerItem>;
}

export function ChartWrapper({ children }: { children: ReactNode }) {
  return (
    <AnimatedCard delay={0.35} hover={false}>
      {children}
    </AnimatedCard>
  );
}
