"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, FileDown } from "lucide-react";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getAvailableMonths() {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const months: { label: string; month: number; year: number }[] = [];
  for (let m = 0; m <= currentMonth; m++) {
    months.push({
      label: `${monthNames[m]} ${year}`,
      month: m,
      year,
    });
  }
  return months;
}

interface MonthPickerModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (month: number, year: number) => Promise<boolean>;
  title: string;
}

export default function MonthPickerModal({ open, onClose, onExport, title }: MonthPickerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const months = getAvailableMonths();

  const handleExport = async (month: number, year: number, label: string) => {
    setError(null);
    setLoading(true);
    try {
      const ok = await onExport(month, year);
      if (!ok) {
        setError(`No data found for ${label}`);
        return;
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    setError(null);
    setLoading(true);
    try {
      const ok = await onExport(-1, -1);
      if (!ok) {
        setError("No data found");
        return;
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-bg-surface p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  {title}
                </h2>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleExportAll}
              disabled={loading}
              className="w-full mb-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/20 transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileDown size={16} />
              Download All Time
            </button>

            <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1">
              {months.map(({ label, month, year }) => (
                <button
                  key={`${year}-${month}`}
                  onClick={() => handleExport(month, year, label)}
                  disabled={loading}
                  className="w-full rounded-xl px-4 py-3 text-sm text-left text-text-secondary hover:bg-white/5 hover:text-text-primary transition-all duration-150 min-h-[44px] flex items-center gap-2 disabled:opacity-50"
                >
                  <FileDown size={14} className="text-text-muted shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
