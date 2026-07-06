"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 };
const springGentle = { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 };
const springSnappy = { type: "spring" as const, stiffness: 400, damping: 25, mass: 0.8 };

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.99 }}
      transition={{ ...springGentle, duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, className, delay = 0, y = 12 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...springSnappy, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({
  children,
  className,
  direction = "up",
  delay = 0,
}: { children: ReactNode; className?: string; direction?: "up" | "down" | "left" | "right"; delay?: number }) {
  const dirMap = { up: { y: 20 }, down: { y: -20 }, left: { x: 20 }, right: { x: -20 } };
  return (
    <motion.div
      initial={{ opacity: 0, ...dirMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...springGentle, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
  delayFirst = 0,
}: { children: ReactNode; className?: string; staggerDelay?: number; delayFirst?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay, delayChildren: delayFirst } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { ...springGentle } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hover = true,
  tap = true,
  ...props
}: { children: ReactNode; className?: string; delay?: number; hover?: boolean; tap?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay }}
      whileHover={hover ? { y: -2, transition: { ...spring } } : undefined}
      whileTap={tap ? { scale: 0.98, transition: { ...spring } } : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedButton({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & Record<string, unknown>) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 25 } }}
      whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function AnimatedLink({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & Record<string, unknown>) {
  return (
    <motion.a
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 25 } }}
      whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      className={className}
      {...props}
    >
      {children}
    </motion.a>
  );
}

export { AnimatePresence };

export function AnimatedListItem({
  children,
  className,
}: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: 8, height: 0 }}
      transition={{ ...springGentle }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const MotionDiv = motion.div;

export const MotionSpan = motion.span;
