"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCheckInsByDate } from "@/lib/actions/attendance";

type CheckInRecord = {
  id: string;
  memberId: string | null;
  memberName: string | null;
  checkInTime: Date;
  member: { firstName: string } | null;
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const shift = (d: string, n: number) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 };

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(today());
  const isToday = selectedDate >= today();

  const { data: checkins = [], isLoading } = useQuery({
    queryKey: ["checkins", selectedDate],
    queryFn: () => getCheckInsByDate(selectedDate),
    refetchInterval: isToday ? 5000 : false,
  });

  return (
    <div className="space-y-4 p-4">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.05 }}
        className="text-2xl font-bold tracking-tight text-text-primary"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Attendance
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.1 }}
        className="glass-card flex items-center gap-2 rounded-xl px-3 py-2"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSelectedDate(shift(selectedDate, -1))}
          className="rounded-lg p-2 bg-primary/15 text-primary hover:bg-primary/25 transition-all duration-200"
        >
          <ChevronLeft size={18} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSelectedDate(today())}
          className="flex-1 text-center text-sm font-medium text-primary bg-primary/15 rounded-lg px-3 py-1.5 shadow-sm shadow-primary/20 transition-all duration-200"
        >
          {fmt(new Date(selectedDate))}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSelectedDate(shift(selectedDate, 1))}
          disabled={isToday}
          className="rounded-lg p-2 bg-primary/15 text-primary hover:bg-primary/25 transition-all duration-200 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </motion.button>
      </motion.div>

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center p-8"
        >
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </motion.div>
      ) : checkins.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.15 }}
          className="space-y-3"
        >
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
            <Clock size={14} /> Check-ins
          </h2>
          <AnimatePresence mode="popLayout">
            {checkins.map((record: CheckInRecord, i: number) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ...springGentle, delay: 0.2 + i * 0.04 }}
                className="glass-card flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-white/[0.06]"
              >
                <CheckCircle size={18} className="shrink-0 text-green-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {record.member ? record.member.firstName : record.memberName ? `${record.memberName} (deleted)` : "Deleted"}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-text-muted">
                  {new Date(record.checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-text-muted py-8"
        >
          No check-ins for this date
        </motion.p>
      )}
    </div>
  );
}
