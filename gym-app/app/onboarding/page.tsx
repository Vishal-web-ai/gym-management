"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import { Check, Dumbbell, ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { checkOnboardingStatus, saveOwnerName, saveGymName, savePlan } from "@/lib/actions/onboarding";

const STEPS = ["Welcome", "Your Name", "Gym Name", "Membership Plan"];

type Plan = { name: string; price: string; months: string };

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.9 };

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(0);

  const [ownerName, setOwnerName] = useState("");
  const [gymName, setGymName] = useState("");
  const [plans, setPlans] = useState<Plan[]>([{ name: "", price: "", months: "" }]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }
    checkOnboardingStatus().then((status) => {
      if (status.role === "MEMBER") {
        router.replace("/member");
        return;
      }
      if (!status.needsOwnerName && !status.needsGymName && !status.needsPlans) {
        router.replace("/dashboard");
        return;
      }
      if (!status.needsOwnerName) setStep(2);
      if (!status.needsOwnerName && !status.needsGymName) setStep(3);
      setLoading(false);
    });
  }, [isLoaded, isSignedIn, router]);

  async function handleFinish() {
    setSaving(true);
    setError("");
    try {
      if (ownerName.trim()) {
        await saveOwnerName(ownerName.trim());
      }
      if (gymName.trim()) {
        await saveGymName(gymName.trim());
      }
      const validPlans = plans.filter((p) => p.name.trim() && p.price && p.months);
      for (const p of validPlans) {
        await savePlan(p.name.trim(), Number(p.price), Number(p.months));
      }
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSaving(false);
    }
  }

  function addPlan() {
    setPlans((prev) => [...prev, { name: "", price: "", months: "" }]);
  }

  function removePlan(i: number) {
    setPlans((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updatePlan(i: number, field: keyof Plan, value: string) {
    setPlans((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  function goNext() {
    setError("");
    if (step === 1 && !ownerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (step === 2 && !gymName.trim()) {
      setError("Please enter a gym name");
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setError("");
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }

  function signOutAndRedirect() {
    signOut();
    router.push("/sign-in");
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-8">
      <div className="onboarding-card mx-auto w-full max-w-3xl p-6 md:p-8 flex flex-col min-h-[420px] max-h-[90vh]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-subtle">
            <Dumbbell size={22} className="text-primary" />
          </div>
          <span className="text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Gym Manager
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                      done
                        ? "bg-primary text-white"
                        : current
                          ? "bg-primary-subtle text-primary ring-2 ring-primary/30"
                          : "bg-white/[0.04] text-text-muted"
                    }`}
                  >
                    {done ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                      current ? "text-text-primary" : "text-text-muted"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-5 transition-colors duration-300 ${
                      done ? "bg-primary" : "bg-white/[0.08]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
                transition={{ ...spring }}
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                        Welcome!
                      </h1>
                      <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                        You&apos;re signed in as{" "}
                        <span className="text-text-primary font-medium">
                          {user?.emailAddresses?.[0]?.emailAddress}
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                        What&apos;s your name?
                      </h1>
                      <p className="mt-1.5 text-sm text-text-secondary">
                        We&apos;ll use this to personalize your experience.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Your Name</label>
                      <input
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200 focus:bg-white/[0.06]"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                        Name Your Gym
                      </h1>
                      <p className="mt-1.5 text-sm text-text-secondary">
                        What&apos;s the name of your gym or fitness center?
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Gym Name</label>
                      <input
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        placeholder="e.g. Iron Forge Gym"
                        className="w-full rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200 focus:bg-white/[0.06]"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                        Membership Plans
                      </h1>
                      <p className="mt-1.5 text-sm text-text-secondary">
                        Add at least one membership plan to get started.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {plans.map((plan, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...spring, delay: i * 0.06 }}
                          className="glass-card rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted" style={{ fontFamily: "var(--font-display)" }}>
                              Plan {i + 1}
                            </p>
                            {plans.length > 1 && (
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removePlan(i)}
                                className="flex size-7 items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 size={13} />
                              </motion.button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 space-y-1.5">
                              <label className="text-xs text-text-muted">Plan Name</label>
                              <input
                                value={plan.name}
                                onChange={(e) => updatePlan(i, "name", e.target.value)}
                                placeholder="e.g. Basic Monthly"
                                className="w-full rounded-lg bg-white/[0.04] px-3.5 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200 focus:bg-white/[0.06]"
                              />
                            </div>
                            <div className="w-28 space-y-1.5">
                              <label className="text-xs text-text-muted">Price (₹)</label>
                              <input
                                type="number"
                                value={plan.price}
                                onChange={(e) => updatePlan(i, "price", e.target.value)}
                                placeholder="499"
                                className="w-full rounded-lg bg-white/[0.04] px-3.5 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200 focus:bg-white/[0.06]"
                              />
                            </div>
                            <div className="w-24 space-y-1.5">
                              <label className="text-xs text-text-muted">Months</label>
                              <input
                                type="number"
                                min="1"
                                value={plan.months}
                                onChange={(e) => updatePlan(i, "months", e.target.value)}
                                placeholder="3"
                                className="w-full rounded-lg bg-white/[0.04] px-3.5 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200 focus:bg-white/[0.06]"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={addPlan}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] py-3.5 text-sm font-medium text-text-muted hover:border-primary/30 hover:text-primary hover:bg-primary-subtle"
                    >
                      <Plus size={16} />
                      Add Another Plan
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (step === 0) {
                  signOutAndRedirect();
                } else {
                  goBack();
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-5 py-3 text-sm font-medium text-text-secondary hover:text-text-primary min-h-[48px]"
            >
              <ArrowLeft size={16} />
              {step === 0 ? "Sign Out" : "Back"}
            </motion.button>

            {step < STEPS.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/20 min-h-[48px]"
              >
                Continue
                <ArrowRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                disabled={saving || plans.every((p) => !p.name.trim() || !p.price || !p.months)}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/20 disabled:opacity-50 min-h-[48px]"
              >
                {saving ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    Finish Setup
                    <Check size={16} />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
