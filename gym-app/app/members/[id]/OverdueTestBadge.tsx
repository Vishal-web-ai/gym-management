"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

function overdueText(endDate: Date, now: Date): string {
  const end = new Date(endDate);
  let months = (now.getFullYear() - end.getFullYear()) * 12 + (now.getMonth() - end.getMonth());
  let days = now.getDate() - end.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  const parts: string[] = [];
  if (months > 0) parts.push(`${months} month`);
  if (days > 0) parts.push(`${days} days`);
  return parts.length ? `Overdue by ${parts.join(" ")}` : "Expires today";
}

export default function OverdueTestBadge({ endDate }: { endDate: string | null }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("testOverdueMonths");
    if (stored) setOffset(parseInt(stored, 10) || 0);
  }, []);

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem("testOverdueMonths");
      setOffset(parseInt(stored || "0", 10) || 0);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (!offset || !endDate) return null;

  const now = new Date();
  now.setMonth(now.getMonth() + offset);
  const end = new Date(endDate);

  if (end > now) {
    const remainingMs = end.getTime() - now.getTime();
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    const needed = Math.ceil(remainingDays / 30) + 1;
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400 flex items-center gap-2">
        <AlertTriangle size={16} className="shrink-0" />
        <span>Test mode ({offset}mo ahead): {remainingDays}d remaining — try +{needed}mo to see overdue text</span>
      </div>
    );
  }

  const text = overdueText(end, now);

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400 flex items-center gap-2">
      <AlertTriangle size={16} className="shrink-0" />
      <span>Test mode ({offset}mo ahead): would show &ldquo;{text}&rdquo;</span>
    </div>
  );
}
