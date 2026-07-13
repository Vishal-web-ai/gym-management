"use client";

import { useState } from "react";
import { motion } from "motion/react";
import MonthPickerModal from "@/components/MonthPickerModal";

export default function ExportExpensesButton() {
  const [open, setOpen] = useState(false);

  const handleExport = async (month: number, year: number): Promise<boolean> => {
    const { exportExpensesCSV } = await import("@/lib/actions/members");
    const isAll = month === -1 && year === -1;
    const csv = await exportExpensesCSV(isAll ? undefined : month, isAll ? undefined : year);
    if (csv.split("\n").length <= 2) return false;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isAll ? "expenses_all.csv" : `expenses_${year}_${String(month + 1).padStart(2, "0")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary/15 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/25 transition-all duration-200 min-h-[44px] flex items-center gap-1"
      >
        Export CSV
      </motion.button>
      <MonthPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onExport={handleExport}
        title="Export Expenses"
      />
    </>
  );
}
