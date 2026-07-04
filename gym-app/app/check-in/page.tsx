"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Phone,
  ArrowRight,
  RefreshCw,
  Building,
} from "lucide-react";
import { getGymConfigPublic, checkInByPhone } from "@/lib/actions/attendance";

type GymConfig = {
  gymName: string;
  gymLat: number | null;
  gymLng: number | null;
  gymRadius: number | null;
} | null;

function CheckInContent() {
  const searchParams = useSearchParams();
  const gymId = searchParams.get("gymId");

  const [loading, setLoading] = useState(true);
  const [gymConfig, setGymConfig] = useState<GymConfig>(null);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    memberName: string;
    status: string;
    checkInTime: Date;
  } | null>(null);

  // GPS verification state
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "success" | "error"
  >("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!gymId) {
      setError("Invalid Check-In Link. Missing Gym ID.");
      setLoading(false);
      return;
    }

    async function loadGym() {
      try {
        const config = await getGymConfigPublic(gymId!);
        if (!config) {
          setError("Gym not found. Please double-check the link.");
        } else {
          setGymConfig(config);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load gym configuration.");
      } finally {
        setLoading(false);
      }
    }

    loadGym();
  }, [gymId]);

  const requestGPS = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      setLocationStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(newCoords);
          setLocationStatus("success");
          resolve(newCoords);
        },
        (error) => {
          setLocationStatus("error");
          let msg = "Could not verify your location. ";
          if (error.code === error.PERMISSION_DENIED) {
            msg += "Please enable GPS location access in your browser settings.";
          } else {
            msg += error.message;
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !gymId) return;

    setError(null);
    setCheckingIn(true);

    try {
      let currentLat: number | undefined;
      let currentLng: number | undefined;

      // If location config is set, verify location
      if (gymConfig?.gymLat !== null && gymConfig?.gymLng !== null) {
        try {
          const location = await requestGPS();
          currentLat = location.lat;
          currentLng = location.lng;
        } catch (locationErr: any) {
          setError(locationErr.message);
          setCheckingIn(false);
          return;
        }
      }

      const res = await checkInByPhone(phone, gymId, currentLat, currentLng);
      setCheckInResult(res);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during check-in.");
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-text-muted">Loading Gym Attendance Portal...</p>
      </div>
    );
  }

  if (error && !gymConfig) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <AlertTriangle size={32} />
        </div>
        <h1 className="mt-6 text-xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Invalid Check-In
        </h1>
        <p className="mt-2 text-sm text-text-muted max-w-xs">{error}</p>
      </div>
    );
  }

  if (checkInResult) {
    const isOverdue = checkInResult.status === "Overdue";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080E1A] px-4 py-8">
        <div
          className={`w-full max-w-sm rounded-3xl border p-8 text-center shadow-2xl animate-scale-in ${
            isOverdue
              ? "border-amber-500/30 bg-amber-500/[0.02]"
              : "border-emerald-500/30 bg-emerald-500/[0.02]"
          }`}
        >
          {/* Success Check Ring */}
          <div className="flex justify-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full animate-forge-glow ${
                isOverdue
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              <CheckCircle size={56} className="animate-pulse" />
            </div>
          </div>

          <h1 className="mt-8 text-2xl font-black text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            CHECK-IN RECORDED
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {new Date(checkInResult.checkInTime).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>

          <div className="mt-6 rounded-2xl bg-white/[0.02] p-5 border border-white/[0.04]">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Member Name</p>
            <p className="mt-1 text-xl font-bold text-white leading-tight">
              {checkInResult.memberName}
            </p>

            <div className="mt-4 flex items-center justify-center">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                  isOverdue
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {isOverdue ? "OVERDUE PAYMENT" : "ACTIVE MEMBER"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 rounded-xl bg-primary/5 p-4 border border-primary/10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">
              Action Required
            </p>
            <p className="text-sm font-medium text-text-secondary leading-relaxed">
              Show this screen to the front desk receptionist.
            </p>
          </div>

          <button
            onClick={() => {
              setCheckInResult(null);
              setPhone("");
              setError(null);
            }}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.04] py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/[0.08] active:scale-[0.98] border border-white/[0.06] min-h-[48px]"
          >
            <RefreshCw size={16} />
            Check In Another Member
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#080E1A] px-4 py-8">
      <div className="w-full max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Building size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-4" style={{ fontFamily: "var(--font-display)" }}>
            {gymConfig?.gymName}
          </h1>
          <p className="text-sm text-text-muted max-w-[280px] mx-auto">
            Welcome! Enter your phone number below to record your attendance.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-card rounded-3xl p-6 border border-white/[0.06] shadow-xl">
          <form onSubmit={handleCheckIn} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {gymConfig?.gymLat !== null && gymConfig?.gymLng !== null && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-primary/5 p-4 border border-primary/10 text-xs">
                <MapPin size={16} className="text-primary shrink-0 animate-bounce" />
                <div className="text-left text-text-muted">
                  <span className="font-semibold text-primary block">
                    GPS Verification Active
                  </span>
                  Your location will be checked to confirm you are at the front desk.
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider pl-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="tel"
                  required
                  placeholder="Enter registered phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl bg-white/[0.03] py-4 pl-11 pr-4 text-base text-white placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary focus:bg-white/[0.05]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={checkingIn}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 min-h-[48px] shadow-lg shadow-primary/20"
            >
              {checkingIn ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  Check In Now
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-text-muted">Loading Gym Attendance Portal...</p>
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}
