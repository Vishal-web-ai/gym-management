"use client";

import { motion } from "motion/react";

type MonthData = {
  label: string;
  revenue: number;
  expenses: number;
};

const spring = { type: "spring" as const, stiffness: 200, damping: 25, mass: 0.8 };

export default function RevenueChart({ data }: { data: MonthData[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)), 1);
  const year = new Date().getFullYear();

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="mb-4 text-sm font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
        Revenue vs Expenses ({year})
      </h3>
      <div className="overflow-x-auto scrollbar-hidden -mx-4 px-4">
        <div className="flex items-end gap-1.5" style={{ height: 160, minWidth: 440 }}>
          {data.map((m, i) => {
            const revH = (m.revenue / maxVal) * 130;
            const expH = (m.expenses / maxVal) * 130;
            return <Bar key={m.label} m={m} revH={revH} expH={expH} index={i} />;
          })}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-gradient-to-b from-emerald-400 to-emerald-600" /> Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-gradient-to-b from-rose-400 to-rose-600" /> Expenses
        </span>
      </div>
    </div>
  );
}

function Bar({ m, revH, expH, index }: { m: MonthData; revH: number; expH: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.4 + index * 0.03 }}
      className="group relative flex flex-1 flex-col items-center justify-end gap-0.5 min-w-[30px]"
    >
      <div className="w-full flex flex-col items-center" style={{ height: 130, justifyContent: "flex-end" }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: Math.max(revH, 2) }}
          transition={{ ...spring, delay: 0.4 + index * 0.03 }}
          className="w-full rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-400 cursor-pointer hover:scale-y-110 hover:opacity-90 origin-bottom transition-transform duration-200"
        />
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: Math.max(expH, 2) }}
          transition={{ ...spring, delay: 0.45 + index * 0.03 }}
          className="w-full rounded-t-sm bg-gradient-to-t from-rose-600 to-rose-400 cursor-pointer hover:scale-y-110 hover:opacity-90 origin-bottom transition-transform duration-200"
        />
      </div>
      <span className="text-[10px] text-text-muted mt-1 truncate w-full text-center">
        {m.label}
      </span>
    </motion.div>
  );
}
