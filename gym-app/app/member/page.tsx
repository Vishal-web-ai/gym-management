"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
import { motion, AnimatePresence } from "motion/react";
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
import ProfilePhoto from "@/components/ProfilePhoto";
import { AnimatedCard } from "@/components/animations";

type Tab = "dashboard" | "profile";
type StreakData = { current: number; best: number };
type CalendarDay = { date: number; day: number };
type MemberDashboard = NonNullable<Awaited<ReturnType<typeof getMemberDashboard>>>;
type PersonalRecord = MemberDashboard["personalRecords"][number];
type PaymentHistory = Awaited<ReturnType<typeof getPaymentHistory>>;

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 };
const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.9 };

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
  const [identified, setIdentified] = useState<{ id: string; name: string; status: string; endDate: string | null; image: string | null } | null>(null);
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
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);
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
      getMemberById(memberId, gymUserId!)
        .then((member) => {
          if (cancelled) return;
          if (member && member.userId === gymUserId) {
            localStorage.setItem(`gym_member_${gymUserId}`, JSON.stringify(member));
            setIdentified({ id: member.id, name: member.firstName, status: member.status, endDate: member.endDate ? member.endDate.toISOString() : null, image: member.image ?? null });
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
          const parsed = JSON.parse(saved) as { id?: string; firstName?: string; status?: string; endDate?: string | null; image?: string | null };
          if (parsed.id && parsed.firstName) {
            setIdentified({ id: parsed.id, name: parsed.firstName, status: parsed.status || "", endDate: parsed.endDate || null, image: parsed.image ?? null });
            setShowPhoneEntry(false);
          }
        } catch {
          localStorage.removeItem(`gym_member_${gymUserId}`);
        }
      }
    }

    getGymConfigByUserId(gymUserId!).then((cfg) => {
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
        lastPos.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
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
      let lat = lastPos.current?.lat;
      let lng = lastPos.current?.lng;
      if (lat === undefined || lng === undefined) {
        if (navigator.geolocation) {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true, timeout: 10000,
            });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }
      }
      await checkInMemberWithGPS(identified.id, gymUserId!, lat, lng);
      setCheckInSuccess(true);
      setAlreadyCheckedIn(true);
      setCheckInVersion((v) => v + 1);

      const now = new Date();
      const streak = await getWeeklyStreak(identified.id, gymUserId!, now.getFullYear(), now.getMonth() + 1);
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
      hasCheckedInToday(identified.id, gymUserId!).then(setAlreadyCheckedIn);
    });
  }, [identified]);

  async function handlePhoneSubmit() {
    if (!phone.trim() || !gymUserId) return;
    setPhoneLoading(true);
    setPhoneError("");
    try {
      const member = await findMemberByPhone(phone.trim(), gymUserId!);
      if (!member) {
        setPhoneError("No member found with this phone number");
        return;
      }
      localStorage.setItem(`gym_member_${gymUserId}`, JSON.stringify(member));
      setIdentified({ id: member.id, name: member.firstName, status: member.status, endDate: member.endDate ? member.endDate.toISOString() : null, image: member.image ?? null });
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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle }}
          className="w-full max-w-sm space-y-6"
        >
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
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 flex items-center gap-1"
              >
                <AlertTriangle size="12" />
                {phoneError}
              </motion.p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePhoneSubmit}
              disabled={phoneLoading || !phone.trim()}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-medium text-white disabled:opacity-50 min-h-[48px]"
            >
              {phoneLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Checking...
                </span>
              ) : (
                "Continue"
              )}
            </motion.button>
          </div>

          <p className="text-center text-xs text-text-muted">
            Don&apos;t have a membership yet? Contact the gym staff.
          </p>
      </motion.div>
    </div>
  );
}

function CelebrationOverlay({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  const message =
    streak >= 10
      ? [`${streak} in a row nice!`, "Absolute legend!", "No days off!"]
      : streak >= 5
      ? [`Day ${streak}! On fire!`, "Getting consistent!", "Keep showing up!"]
      : streak >= 3
      ? [`Day ${streak}! Let's go!`, "Building momentum!", "3 in a row nice!"]
      : ["Let's go!", "First of many!", "Showing up is winning!"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="text-center space-y-3 pointer-events-none"
      >
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
      </motion.div>
    </motion.div>
  );
}

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 pb-20">

        {identified && isAccessRestricted(identified.status, identified.endDate) ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle }}
            className="flex flex-col items-center justify-center px-4 py-20 text-center"
          >
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Access Restricted
            </h2>
            <p className="mt-2 max-w-xs text-sm text-text-muted">
              Your membership has expired. Please contact the gym staff to renew your membership and regain access.
            </p>
          </motion.div>
        ) : (
          <>
            {tab === "dashboard" && identified && (
              <>
                {memberId && !isAccessRestricted(identified.status, identified.endDate) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springGentle, delay: 0.05 }}
                    className="space-y-3 p-4 border-b border-white/[0.06] mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <ProfilePhoto image={identified.image} name={identified.name} />
                      <div>
                        <p className="text-sm text-text-muted">Welcome back,</p>
                        <p className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                          {identified.name}
                        </p>
                      </div>
                    </div>

                    {gymConfig && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`rounded-xl border p-3 flex items-center gap-3 ${
                          gpsStatus === "verified" ? "border-emerald-500/30 bg-emerald-500/5" :
                          gpsStatus === "far" ? "border-red-500/30 bg-red-500/5" :
                          gpsStatus === "denied" ? "border-red-500/30 bg-red-500/5" :
                          "border-white/[0.08] bg-white/[0.02]"
                        }`}
                      >
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
                      </motion.div>
                    )}

                    {checkInSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...springGentle }}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center"
                      >
                        <CheckCircle size={32} className="mx-auto text-emerald-400 mb-1" />
                        <p className="text-sm font-bold text-emerald-400">Checked In!</p>
                        <p className="text-xs text-text-muted mt-1">Your attendance has been recorded for today.</p>
                      </motion.div>
                    ) : alreadyCheckedIn ? (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                        <CheckCircle size={20} className="mx-auto text-emerald-400 mb-1" />
                        <p className="text-sm font-medium text-emerald-400">Already checked in today</p>
                      </div>
                    ) : !gymConfig || gpsStatus === "verified" ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCheckIn}
                        disabled={checkingIn}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50 min-h-[48px] shadow-lg shadow-primary/20"
                      >
                        {checkingIn ? (
                          <><Loader2 size={18} className="animate-spin" /> Checking in...</>
                        ) : (
                          <><LogIn size={18} /> Check In Now</>
                        )}
                      </motion.button>
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
                  </motion.div>
                )}
                <DashboardTab memberId={identified.id} gymUserId={gymUserId!} checkInVersion={checkInVersion} />
              </>
            )}
            {tab === "profile" && identified && (
              <ProfileTab memberId={identified.id} gymUserId={gymUserId!} gymName={gymName} />
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay streak={celebrationStreak} onDismiss={() => setShowCelebration(false)} />
        )}
      </AnimatePresence>

      {(!identified || !isAccessRestricted(identified.status, identified.endDate)) && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] bg-bg-base/90 backdrop-blur-2xl pb-safe">
          {([
            { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
            { id: "profile" as Tab, label: "Profile", icon: User },
          ]).map(({ id, label, icon: Icon }) => {
            const isActive = tab === id;
            return (
              <motion.button
                key={id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTab(id)}
                className="relative flex flex-col items-center gap-0.5 px-4 py-2 text-xs min-h-[48px] min-w-[48px] justify-center"
              >
                {isActive && (
                  <motion.span
                    layoutId="member-nav-active"
                    className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    size={22}
                    className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"}`}
                  />
                </motion.div>
                <span className={`transition-colors duration-200 ${isActive ? "font-semibold text-primary" : "text-text-muted"}`}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function DashboardTab({ memberId, gymUserId, checkInVersion }: { memberId: string; gymUserId: string; checkInVersion: number }) {
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
      getMemberDashboard(memberId, gymUserId),
      getWeeklyStreak(memberId, gymUserId, calYear, calMonth),
      getAttendanceCalendar(memberId, gymUserId, calYear, calMonth),
    ]).then(([d, s, c]) => {
      setData(d);
      setStreak(s);
      setCalendar(c);
      if (d) setPrs(d.personalRecords);
      setLoading(false);
    });
  }, [memberId, gymUserId, calYear, calMonth, checkInVersion]);

  async function handleAddPR() {
    if (!prExercise.trim() || !prWeight) return;
    try {
      const record = await recordPR(memberId, gymUserId, prExercise.trim(), Number(prWeight), Number(prReps));
      setPrs((prev) => [record, ...prev]);
      setShowAddPR(false);
      setPrExercise("");
      setPrWeight("");
      setPrReps("1");
    } catch {}
  }

  async function handleDeletePR(id: string) {
    try {
      await deletePR(id, gymUserId);
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
      await updatePersonalRecord(prId, gymUserId, {
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
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-3">
        <AnimatedCard delay={0.1} hover={false}>
          <div className="glass-card rounded-xl p-4 text-center">
            <Flame size={22} className="mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-text-primary">{streak?.current || 0}</p>
            <p className="text-xs text-text-muted">Day Streak</p>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.15} hover={false}>
          <div className="glass-card rounded-xl p-4 text-center">
            <TrendingUp size={22} className="mx-auto text-emerald-400 mb-1" />
            <p className="text-2xl font-bold text-text-primary">{streak?.best || 0}</p>
            <p className="text-xs text-text-muted">Best Streak</p>
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.2} hover={false}>
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
              <Clock size={14} />
              Attendance Calendar
            </h2>
            <span className="text-sm font-medium text-text-primary">
              {new Date(calYear, calMonth - 1).toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
            <div className="flex gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (calMonth === 1) { setCalYear((y) => y - 1); setCalMonth(12); }
                  else setCalMonth((m) => m - 1);
                }}
                className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-text-muted"
              >Prev</motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (calMonth === 12) { setCalYear((y) => y + 1); setCalMonth(1); }
                  else setCalMonth((m) => m + 1);
                }}
                className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-text-muted"
              >Next</motion.button>
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
      </AnimatedCard>

      <AnimatedCard delay={0.25} hover={false}>
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
              Personal Records
            </h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddPR(true)}
              className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
            >
              <Plus size={14} />
              Add PR
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddPR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ ...springGentle }}
                className="rounded-lg bg-white/[0.03] p-3 space-y-3 overflow-hidden"
              >
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
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddPR} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white">Save</motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {prs.length === 0 ? (
            <p className="text-sm text-text-muted">No personal records yet.</p>
          ) : (
            <div className="space-y-2">
              {prs.map((pr) => (
                editingPrId === pr.id ? (
                  <motion.div
                    key={pr.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-white/[0.03] p-3 space-y-3 overflow-hidden"
                  >
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
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleUpdatePR(pr.id)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white">Save</motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={pr.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...springGentle }}
                    className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5"
                  >
                    <Dumbbell size={14} className="text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{pr.exercise}</p>
                      <p className="text-xs text-text-muted">{pr.weight} kg × {pr.reps} reps</p>
                    </div>
                    <p className="text-xs text-text-muted shrink-0">
                      {new Date(pr.date).toLocaleDateString("en-IN")}
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStartEdit(pr)}
                      className="flex size-7 items-center justify-center rounded-lg text-text-muted hover:text-primary"
                    >
                      <Pencil size={12} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeletePR(pr.id)}
                      className="flex size-7 items-center justify-center rounded-lg text-text-muted hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </motion.button>
                  </motion.div>
                )
              ))}
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
}

function ProfileTab({ memberId, gymUserId, gymName }: { memberId: string; gymUserId: string; gymName: string }) {
  const [data, setData] = useState<MemberDashboard | null>(null);
  const [payments, setPayments] = useState<PaymentHistory>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMemberDashboard(memberId, gymUserId),
      getPaymentHistory(memberId, gymUserId),
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
    <div className="space-y-4 p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.05 }}
        className="flex items-center gap-4"
      >
        <ProfilePhoto image={data.member.image} name={data.member.firstName} className="size-16" textClassName="text-2xl" />
        <div>
          <h1 className="text-xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            {data.member.firstName}
          </h1>
          <p className="text-sm text-text-muted">{data.member.phone}</p>
        </div>
      </motion.div>

      <AnimatedCard delay={0.1}>
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
      </AnimatedCard>

      <AnimatedCard delay={0.2}>
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
            <Receipt size={14} />
            Payment History
          </h2>
          {payments.length === 0 ? (
            <p className="text-sm text-text-muted">No payments recorded.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springGentle, delay: 0.25 + i * 0.04 }}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">₹{p.amount.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-text-muted">{p.mode} · {new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className={`text-xs font-medium ${
                    p.status === "Paid" ? "text-emerald-400" : "text-red-400"
                  }`}>{p.status}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
}
