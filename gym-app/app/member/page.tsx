"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Loader2,
  Dumbbell,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  Flame,
  Receipt,
  Clock,
  AlertTriangle,
  MapPin,
  CheckCircle,
  LogIn,
} from "lucide-react";
import {
  findMemberByPhone,
  getMemberDashboard,
  getWeeklyStreak,
  getAttendanceCalendar,
  getPaymentHistory,
  recordPR,
  deletePR,
  updatePersonalRecord,
  getGymConfigByUserId,
  getMemberById,
  checkInMemberWithGPS,
} from "@/lib/actions/member";

type Tab = "dashboard" | "profile";
type StreakData = { current: number; best: number };
type CalendarDay = { date: number; day: number };
type MemberDashboard = NonNullable<Awaited<ReturnType<typeof getMemberDashboard>>>;
type PersonalRecord = MemberDashboard["personalRecords"][number];
type PaymentHistory = Awaited<ReturnType<typeof getPaymentHistory>>;

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MemberPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-full items-center justify-center p-8">
        <Loader2 size={24} className="animate-spin text-text-muted" />
      </div>
    }>
      <MemberContent />
    </Suspense>
  );
}

function isAccessRestricted(status: string, endDate: string | null): boolean {
  if (status === "Expired") return true;
  if (status === "Frozen") return false;
  if (status === "Overdue" && endDate) {
    const graceEnd = new Date(new Date(endDate).getTime() + 10 * 24 * 60 * 60 * 1000);
    if (new Date() > graceEnd) return true;
  }
  return false;
}

function MemberContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gymUserId = searchParams.get("gym");
  const memberId = searchParams.get("memberId");
  const [identified, setIdentified] = useState<{ id: string; name: string; status: string; endDate: string | null } | null>(null);
  const [showPhoneEntry, setShowPhoneEntry] = useState(!memberId);
  const [memberLinkLoading, setMemberLinkLoading] = useState(!!memberId);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [tab, setTab] = useState<Tab>("dashboard");
  const [gymName, setGymName] = useState("");

  // GPS + check-in state
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "verified" | "denied" | "far">("idle");
  const [distance, setDistance] = useState<number | null>(null);
  const [gymConfig, setGymConfig] = useState<{ gymLat: number; gymLng: number; gymRadius: number } | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInError, setCheckInError] = useState("");
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [checkInVersion, setCheckInVersion] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);

  useEffect(() => {
    if (!gymUserId) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    if (memberId) {
      setMemberLinkLoading(true);
      setShowPhoneEntry(false);
      getMemberById(memberId)
        .then((member) => {
          if (cancelled) return;
          if (member && member.userId === gymUserId) {
            localStorage.setItem(`gym_member_${gymUserId}`, JSON.stringify(member));
            setIdentified({ id: member.id, name: member.firstName, status: member.status, endDate: member.endDate ? member.endDate.toISOString() : null });
            setShowPhoneEntry(false);
            return;
          }

          setIdentified(null);
          setShowPhoneEntry(true);
          setPhoneError("This member link is not valid. Enter your registered phone number.");
        })
        .catch(() => {
          if (cancelled) return;
          setIdentified(null);
          setShowPhoneEntry(true);
          setPhoneError("Could not open this member link. Enter your registered phone number.");
        })
        .finally(() => {
          if (!cancelled) setMemberLinkLoading(false);
        });
    } else {
      setMemberLinkLoading(false);
      const saved = localStorage.getItem(`gym_member_${gymUserId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { id?: string; firstName?: string; status?: string; endDate?: string | null };
          if (parsed.id && parsed.firstName) {
            setIdentified({ id: parsed.id, name: parsed.firstName, status: parsed.status || "", endDate: parsed.endDate || null });
            setShowPhoneEntry(false);
          }
        } catch {
          localStorage.removeItem(`gym_member_${gymUserId}`);
        }
      }
    }

    getGymConfigByUserId(gymUserId).then((cfg) => {
      if (cancelled) return;
      if (cfg) {
        setGymName(cfg.gymName);
        if (cfg.gymLat && cfg.gymLng && cfg.gymRadius) {
          setGymConfig({ gymLat: cfg.gymLat, gymLng: cfg.gymLng, gymRadius: cfg.gymRadius });
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [gymUserId, memberId, router]);

  // Start GPS tracking when identified via link
  useEffect(() => {
    if (!identified || !memberId || !gymConfig) return;
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    let cancelled = false;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (cancelled) return;
        const R = 6371e3;
        const lat1 = (pos.coords.latitude * Math.PI) / 180;
        const lat2 = (gymConfig.gymLat * Math.PI) / 180;
        const dlat = ((gymConfig.gymLat - pos.coords.latitude) * Math.PI) / 180;
        const dlng = ((gymConfig.gymLng - pos.coords.longitude) * Math.PI) / 180;
        const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng / 2) ** 2;
        const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setDistance(Math.round(d));
        if (d <= gymConfig.gymRadius) {
          setGpsStatus("verified");
        } else {
          setGpsStatus("far");
        }
      },
      () => { if (!cancelled) setGpsStatus("denied"); },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
    return () => { cancelled = true; navigator.geolocation.clearWatch(watchId); };
  }, [identified, memberId, gymConfig]);

  async function handleCheckIn() {
    if (!identified) return;
    setCheckingIn(true);
    setCheckInError("");
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, timeout: 10000,
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
      await checkInMemberWithGPS(identified.id, lat, lng);
      setCheckInSuccess(true);
      setAlreadyCheckedIn(true);
      setCheckInVersion((v) => v + 1);

      const streak = await getWeeklyStreak(identified.id);
      setCelebrationStreak(streak?.current || 0);
      setShowCelebration(true);

      const confetti = (await import("canvas-confetti")).default;
      const end = Date.now() + 1500;
      const colors = ["#f97316", "#22c55e", "#3b82f6", "#a855f7", "#eab308"];
      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();

    } catch (e: unknown) {
      setCheckInError(e instanceof Error ? e.message : "Check-in failed");
    }
    setCheckingIn(false);
  }

  useEffect(() => {
    if (!identified) return;
    import("@/lib/actions/member").then(({ hasCheckedInToday }) => {
      hasCheckedInToday(identified.id).then(setAlreadyCheckedIn);
    });
  }, [identified]);

  async function handlePhoneSubmit() {
    if (!phone.trim() || !gymUserId) return;
    setPhoneLoading(true);
    setPhoneError("");
    try {
      const member = await findMemberByPhone(phone.trim(), gymUserId);
      if (!member) {
        setPhoneError("No member found with this phone number");
        return;
      }
      localStorage.setItem(`gym_member_${gymUserId}`, JSON.stringify(member));
      setIdentified({ id: member.id, name: member.firstName, status: member.status, endDate: member.endDate ? member.endDate.toISOString() : null });
      setShowPhoneEntry(false);
    } catch {
      setPhoneError("Something went wrong. Try again.");
    }
    setPhoneLoading(false);
  }

  if (!gymUserId) return null;

  if (memberLinkLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <Loader2 size={20} className="animate-spin" />
          Opening member portal...
        </div>
      </div>
    );
  }

  if (showPhoneEntry) {
    return (
      <div className="flex min-h-full items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            {gymName && (
              <div className="flex items-center justify-center gap-2 mb-2">
                <Dumbbell size={22} className="text-primary" />
                <span className="text-xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  {gymName}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Member Check-in
            </h1>
            <p className="text-sm text-text-muted">Enter your registered phone number to continue</p>
          </div>

          <div className="space-y-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
              placeholder="Enter phone number"
              className="w-full rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            {phoneError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size="12" />
                {phoneError}
              </p>
            )}
            <button
              onClick={handlePhoneSubmit}
              disabled={phoneLoading || !phone.trim()}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
            >
              {phoneLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Checking...
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </div>

          <p className="text-center text-xs text-text-muted">
            Don&apos;t have a membership yet? Contact the gym staff.
          </p>
      </div>
    </div>
  );
}

function CelebrationOverlay({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  const message =
    streak >= 10
      ? [`${streak} in a row nice! 😏`, "Absolute legend!", "No days off! 🔥"]
      : streak >= 5
      ? [`Day ${streak}! On fire! 🔥`, "Getting consistent! 😎", "Keep showing up!"]
      : streak >= 3
      ? [`Day ${streak}! Let's go! 💪`, "Building momentum!", "3 in a row nice!"]
      : ["Let's go! 💪", "First of many!", "Showing up is winning!"];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onDismiss}
    >
      <div className="animate-scale-in text-center space-y-3 pointer-events-none">
        <div className="relative mx-auto flex size-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse" />
          <div className="relative flex size-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40">
            <CheckCircle size={48} fill="white" stroke="#10b981" />
          </div>
        </div>
        <p className="text-xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "var(--font-display)" }}>
          {message[0]}
        </p>
        <p className="text-sm text-white/80 drop-shadow">{message[1]}</p>
        <p className="text-xs text-white/40 mt-4">Tap anywhere to dismiss</p>
      </div>
    </div>
  );
}

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 pb-20">
        {/* Check-in section for WhatsApp link flow */}
        {identified && memberId && !isAccessRestricted(identified.status, identified.endDate) && (
          <div className="space-y-3 p-4 animate-fade-in border-b border-white/[0.06] mb-2">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary-subtle">
                <span className="text-lg font-bold text-primary">
                  {identified.name[0]}
                </span>
              </div>
              <div>
                <p className="text-sm text-text-muted">Welcome back,</p>
                <p className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  {identified.name}
                </p>
              </div>
            </div>

            {/* GPS status (only when configured) */}
            {gymConfig && (
              <div className={`rounded-xl border p-3 flex items-center gap-3 ${
                gpsStatus === "verified" ? "border-emerald-500/30 bg-emerald-500/5" :
                gpsStatus === "far" ? "border-red-500/30 bg-red-500/5" :
                gpsStatus === "denied" ? "border-red-500/30 bg-red-500/5" :
                "border-white/[0.08] bg-white/[0.02]"
              }`}>
                <MapPin size={18} className={
                  gpsStatus === "verified" ? "text-emerald-400" :
                  gpsStatus === "requesting" ? "text-amber-400" :
                  "text-red-400"
                } />
                <p className="text-sm text-text-primary flex-1">
                  {gpsStatus === "idle" && "Detecting your location..."}
                  {gpsStatus === "requesting" && "Requesting GPS..."}
                  {gpsStatus === "verified" && "You're at the gym!"}
                  {gpsStatus === "denied" && "Enable GPS to check in"}
                  {gpsStatus === "far" && `You're ${distance}m away`}
                </p>
              </div>
            )}

            {/* Check-in button / status */}
            {checkInSuccess ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center animate-scale-in">
                <CheckCircle size={32} className="mx-auto text-emerald-400 mb-1" />
                <p className="text-sm font-bold text-emerald-400">Checked In!</p>
                <p className="text-xs text-text-muted mt-1">Your attendance has been recorded for today.</p>
              </div>
            ) : alreadyCheckedIn ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                <CheckCircle size={20} className="mx-auto text-emerald-400 mb-1" />
                <p className="text-sm font-medium text-emerald-400">Already checked in today</p>
              </div>
            ) : !gymConfig || gpsStatus === "verified" ? (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 min-h-[48px] shadow-lg shadow-primary/20"
              >
                {checkingIn ? (
                  <><Loader2 size={18} className="animate-spin" /> Checking in...</>
                ) : (
                  <><LogIn size={18} /> Check In Now</>
                )}
              </button>
            ) : gpsStatus === "denied" || gpsStatus === "far" ? (
              <p className="text-xs text-text-muted text-center">
                {gpsStatus === "denied"
                  ? "Please enable location access in your browser settings to check in."
                  : `Move closer to the gym to check in.`}
              </p>
            ) : null}

            {checkInError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{checkInError}</p>
              </div>
            )}
          </div>
        )}

        {identified && isAccessRestricted(identified.status, identified.endDate) ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center animate-fade-in">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Access Restricted
            </h2>
            <p className="mt-2 max-w-xs text-sm text-text-muted">
              Your membership has expired. Please contact the gym staff to renew your membership and regain access.
            </p>
          </div>
        ) : (
          <>
            {tab === "dashboard" && identified && (
              <DashboardTab memberId={identified.id} checkInVersion={checkInVersion} />
            )}
            {tab === "profile" && identified && (
              <ProfileTab memberId={identified.id} gymName={gymName} />
            )}
          </>
        )}
      </div>

      {showCelebration && (
        <CelebrationOverlay streak={celebrationStreak} onDismiss={() => setShowCelebration(false)} />
      )}

      {(!identified || !isAccessRestricted(identified.status, identified.endDate)) && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] bg-bg-base/90 backdrop-blur-2xl pb-safe">
          {([
            { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
            { id: "profile" as Tab, label: "Profile", icon: User },
          ]).map(({ id, label, icon: Icon }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="relative flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors min-h-[48px] min-w-[48px] justify-center active:scale-95"
              >
                {isActive && (
                  <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary animate-forge-glow" />
                )}
                <Icon
                  size={22}
                  className={`transition-all duration-200 ${isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"}`}
                />
                <span className={`transition-all duration-200 ${isActive ? "font-semibold text-primary" : "text-text-muted"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function DashboardTab({ memberId, checkInVersion }: { memberId: string; checkInVersion: number }) {
  const [data, setData] = useState<MemberDashboard | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPR, setShowAddPR] = useState(false);
  const [prExercise, setPrExercise] = useState("");
  const [prWeight, setPrWeight] = useState("");
  const [prReps, setPrReps] = useState("1");
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [editingPrId, setEditingPrId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ exercise: "", weight: "", reps: "1" });
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    Promise.all([
      getMemberDashboard(memberId),
      getWeeklyStreak(memberId),
      getAttendanceCalendar(memberId, calYear, calMonth),
    ]).then(([d, s, c]) => {
      setData(d);
      setStreak(s);
      setCalendar(c);
      if (d) setPrs(d.personalRecords);
      setLoading(false);
    });
  }, [memberId, calYear, calMonth, checkInVersion]);

  async function handleAddPR() {
    if (!prExercise.trim() || !prWeight) return;
    try {
      const record = await recordPR(memberId, prExercise.trim(), Number(prWeight), Number(prReps));
      setPrs((prev) => [record, ...prev]);
      setShowAddPR(false);
      setPrExercise("");
      setPrWeight("");
      setPrReps("1");
    } catch {}
  }

  async function handleDeletePR(id: string) {
    try {
      await deletePR(id);
      setPrs((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  }

  function handleStartEdit(pr: PersonalRecord) {
    setEditingPrId(pr.id);
    setEditForm({ exercise: pr.exercise, weight: String(pr.weight), reps: String(pr.reps) });
  }

  function handleCancelEdit() {
    setEditingPrId(null);
  }

  async function handleUpdatePR(prId: string) {
    if (!editForm.exercise.trim() || !editForm.weight) return;
    try {
      await updatePersonalRecord(prId, {
        exercise: editForm.exercise.trim(),
        weight: Number(editForm.weight),
        reps: Number(editForm.reps),
      });
      setPrs((prev) => prev.map((p) =>
        p.id === prId
          ? { ...p, exercise: editForm.exercise.trim(), weight: Number(editForm.weight), reps: Number(editForm.reps) }
          : p
      ));
      setEditingPrId(null);
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 size={24} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (!data) return null;

  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
  const calendarDates: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDates.push(i);

  const checkedInDates = new Set(calendar.map((c) => c.date));

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <h1 className="text-xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <Flame size={22} className="mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-text-primary">{streak?.current || 0}</p>
          <p className="text-xs text-text-muted">Day Streak</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <TrendingUp size={22} className="mx-auto text-emerald-400 mb-1" />
          <p className="text-2xl font-bold text-text-primary">{streak?.best || 0}</p>
          <p className="text-xs text-text-muted">Best Streak</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
            <Clock size={14} />
            Attendance Calendar
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => {
                if (calMonth === 1) { setCalYear((y) => y - 1); setCalMonth(12); }
                else setCalMonth((m) => m - 1);
              }}
              className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-text-muted"
            >Prev</button>
            <button
              onClick={() => {
                if (calMonth === 12) { setCalYear((y) => y + 1); setCalMonth(1); }
                else setCalMonth((m) => m + 1);
              }}
              className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-text-muted"
            >Next</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d) => (
            <span key={d} className="text-xs font-medium text-text-muted py-1">{d}</span>
          ))}
          {calendarDates.map((d, i) => (
            <div
              key={i}
              className={`rounded-lg py-1.5 text-xs ${
                d === null ? "" :
                checkedInDates.has(d) ? "bg-primary text-white font-bold" :
                "text-text-muted"
              }`}
            >
              {d || ""}
            </div>
          ))}
        </div>
      </div>



      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
            Personal Records
          </h2>
          <button
            onClick={() => setShowAddPR(true)}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
          >
            <Plus size={14} />
            Add PR
          </button>
        </div>

        {showAddPR && (
          <div className="rounded-lg bg-white/[0.03] p-3 space-y-3 animate-slide-down">
            <input
              value={prExercise}
              onChange={(e) => setPrExercise(e.target.value)}
              placeholder="Exercise name (e.g. Bench Press)"
              className="w-full rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={prWeight}
                onChange={(e) => setPrWeight(e.target.value)}
                placeholder="Weight (kg)"
                className="flex-1 rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
              />
              <input
                type="number"
                value={prReps}
                onChange={(e) => setPrReps(e.target.value)}
                placeholder="Reps"
                className="w-20 rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddPR(false)} className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-text-muted">Cancel</button>
              <button onClick={handleAddPR} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white">Save</button>
            </div>
          </div>
        )}

        {prs.length === 0 ? (
          <p className="text-sm text-text-muted">No personal records yet.</p>
        ) : (
          <div className="space-y-2">
            {prs.map((pr) => (
              editingPrId === pr.id ? (
                <div key={pr.id} className="rounded-lg bg-white/[0.03] p-3 space-y-3 animate-slide-down">
                  <input
                    value={editForm.exercise}
                    onChange={(e) => setEditForm((f) => ({ ...f, exercise: e.target.value }))}
                    placeholder="Exercise name"
                    className="w-full rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editForm.weight}
                      onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))}
                      placeholder="Weight (kg)"
                      className="flex-1 rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
                    />
                    <input
                      type="number"
                      value={editForm.reps}
                      onChange={(e) => setEditForm((f) => ({ ...f, reps: e.target.value }))}
                      placeholder="Reps"
                      className="w-20 rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={handleCancelEdit} className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-text-muted">Cancel</button>
                    <button onClick={() => handleUpdatePR(pr.id)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white">Save</button>
                  </div>
                </div>
              ) : (
                <div key={pr.id} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
                  <Dumbbell size={14} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{pr.exercise}</p>
                    <p className="text-xs text-text-muted">{pr.weight} kg × {pr.reps} reps</p>
                  </div>
                  <p className="text-xs text-text-muted shrink-0">
                    {new Date(pr.date).toLocaleDateString("en-IN")}
                  </p>
                  <button
                    onClick={() => handleStartEdit(pr)}
                    className="flex size-7 items-center justify-center rounded-lg text-text-muted hover:text-primary"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDeletePR(pr.id)}
                    className="flex size-7 items-center justify-center rounded-lg text-text-muted hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileTab({ memberId, gymName }: { memberId: string; gymName: string }) {
  const [data, setData] = useState<MemberDashboard | null>(null);
  const [payments, setPayments] = useState<PaymentHistory>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMemberDashboard(memberId),
      getPaymentHistory(memberId),
    ]).then(([d, p]) => {
      setData(d);
      setPayments(p);
      setLoading(false);
    });
  }, [memberId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 size={24} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-subtle">
          <span className="text-2xl font-bold text-primary">
            {data.member.firstName[0]}{data.member.firstName[1]}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            {data.member.firstName}
          </h1>
          <p className="text-sm text-text-muted">{data.member.phone}</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
          Membership Info
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Gym</span>
            <span className="text-sm font-medium text-text-primary">{gymName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Plan</span>
            <span className="text-sm font-medium text-text-primary">{data.member.plan?.name || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Status</span>
            <span className={`text-sm font-medium ${
              data.member.status === "Active" ? "text-emerald-400" :
              data.member.status === "Frozen" ? "text-cyan-400" :
              "text-red-400"
            }`}>{data.member.status}</span>
          </div>
          {data.member.createdAt && (
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Member Since</span>
              <span className="text-sm font-medium text-text-primary">
                {new Date(data.member.createdAt).toLocaleDateString("en-IN")}
              </span>
            </div>
          )}
          {data.member.plan && (
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Plan Price</span>
              <span className="text-sm font-medium text-text-primary">₹{data.member.plan.price.toLocaleString("en-IN")}</span>
            </div>
          )}
          {data.member.endDate && (
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Valid Till</span>
              <span className="text-sm font-medium text-text-primary">
                {new Date(data.member.endDate).toLocaleDateString("en-IN")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
          <Receipt size={14} />
          Payment History
        </h2>
        {payments.length === 0 ? (
          <p className="text-sm text-text-muted">No payments recorded.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">₹{p.amount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-text-muted">{p.mode} · {new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className={`text-xs font-medium ${
                  p.status === "Paid" ? "text-emerald-400" : "text-red-400"
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
