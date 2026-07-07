"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";

export default function AnimLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="flex-1 pb-20 md:pb-8">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </main>
  );
}
