"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function DateDisplay() {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  if (!date) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
      className="mt-0.5 text-sm text-text-muted"
    >
      {date}
    </motion.p>
  );
}
