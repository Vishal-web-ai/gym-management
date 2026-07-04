"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { getTodayCheckIns } from "@/lib/actions/attendance";

type CheckInRecord = {
  id: string;
  memberId: string | null;
  memberName: string | null;
  checkInTime: string;
  member: { firstName: string } | null;
};

export default function AttendancePage() {
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [recentCheckins, setRecentCheckins] = useState<CheckInRecord[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const todayCheckins = await getTodayCheckIns();
        setRecentCheckins(todayCheckins);
      } catch {
        console.error("Failed to load data");
      }
      setLoadingMembers(false);
    }
    init();
  }, []);

  // Poll for today's check-ins every 5 seconds
  useEffect(() => {
    if (loadingMembers) return;

    const interval = setInterval(async () => {
      try {
        const todayCheckins = await getTodayCheckIns();
        setRecentCheckins(todayCheckins);
      } catch (err) {
        console.error("Failed to poll check-ins:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loadingMembers]);

  if (loadingMembers) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 size={24} className="animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <h1
        className="text-2xl font-bold tracking-tight text-text-primary"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Attendance
      </h1>

      {recentCheckins.length > 0 && (
        <div className="space-y-3 animate-slide-up delay-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
            <Clock size={14} />
            Today&apos;s Check-ins
          </h2>
          {recentCheckins.slice(0, 10).map((record, i) => (
            <div
              key={record.id}
              className={`glass-card flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-white/[0.06] animate-slide-up`}
              style={{ animationDelay: `${(i + 1) * 50}ms` }}
            >
              <CheckCircle size={18} className="shrink-0 text-green-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {record.member ? record.member.firstName : record.memberName ? `${record.memberName} (deleted member)` : "Deleted Member"}
                </p>
              </div>
              <p className="shrink-0 text-xs text-text-muted">
                {new Date(record.checkInTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
