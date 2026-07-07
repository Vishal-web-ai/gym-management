"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const shift = (d: string, n: number) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 };

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const isToday = selectedDate >= todayStr();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  const sel = new Date(selectedDate);
  const [calYear, setCalYear] = useState(sel.getFullYear());
  const [calMonth, setCalMonth] = useState(sel.getMonth());

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openCalendar = useCallback(() => {
    const d = new Date(selectedDate);
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
    setCalendarOpen(true);
  }, [selectedDate]);

  const selectDate = useCallback((day: number) => {
    setSelectedDate(toDateStr(calYear, calMonth, day));
    setCalendarOpen(false);
  }, [calYear, calMonth]);

  const displayDate = (() => {
    const d = new Date(selectedDate);
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  })();

  const { data: checkins = [], isLoading } = useQuery({
    queryKey: ["checkins", selectedDate],
    queryFn: () => getCheckInsByDate(selectedDate),
    staleTime: isToday ? 1000 : 30_000,
    refetchInterval: isToday ? 5000 : false,
  });

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

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
        <div className="flex-1 relative" ref={calRef}>
          <div
            onClick={openCalendar}
            className="w-full cursor-pointer text-center text-sm font-medium text-primary bg-primary/15 rounded-lg px-3 py-1.5 transition-all duration-200 hover:bg-primary/25"
          >
            {displayDate}
          </div>
          <AnimatePresence>
            {calendarOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/[0.08] bg-bg-base/95 backdrop-blur-2xl shadow-2xl sm:left-1/2 sm:-translate-x-1/2 sm:w-80"
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                        else { setCalMonth(calMonth - 1); }
                      }}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-all"
                    >
                      <ChevronLeft size={16} />
                    </motion.button>
                    <span className="text-sm font-semibold text-text-primary">
                      {monthNames[calMonth]} {calYear}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                        else { setCalMonth(calMonth + 1); }
                      }}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-all"
                    >
                      <ChevronRight size={16} />
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {dayHeaders.map((h) => (
                      <div key={h} className="text-center text-xs font-medium text-text-muted py-1">
                        {h}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {calendarDays.map((day, i) => {
                      if (day === null) return <div key={`e-${i}`} />;
                      const dateStr = toDateStr(calYear, calMonth, day);
                      const d = new Date(calYear, calMonth, day);
                      const isSelected = dateStr === selectedDate;
                      const isCurrent = d.getTime() === today.getTime();
                      const isFuture = d > today;
                      return (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.9 }}
                          disabled={isFuture}
                          onClick={() => selectDate(day)}
                          className={`rounded-lg py-1.5 text-sm transition-all ${
                            isSelected
                              ? "bg-primary text-white font-semibold"
                              : isCurrent
                                ? "bg-primary/20 text-primary font-medium"
                                : isFuture
                                  ? "text-text-muted/30 cursor-not-allowed"
                                  : "text-text-muted hover:bg-white/[0.06] hover:text-text-primary"
                          }`}
                        >
                          {day}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
