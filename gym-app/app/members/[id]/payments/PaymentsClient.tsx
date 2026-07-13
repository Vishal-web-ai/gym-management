"use client";

import { useState, useActionState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  Banknote,
  Smartphone,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Check,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import SuccessOverlay from "@/components/SuccessOverlay";
import WhatsAppConfirmModal from "@/components/WhatsAppConfirmModal";
import { logPayment } from "@/lib/actions/members";
import { formatError } from "@/lib/actions/helpers";
import { openWhatsApp, receiptMessage } from "@/lib/whatsapp";

type ApiMember = {
  id: string;
  firstName: string;
  phone: string;
  status: string;
  endDate: Date | null;
  createdAt: Date;
};

type ApiPayment = {
  id: string;
  memberId: string;
  amount: number;
  mode: string;
  status: string;
  createdAt: Date;
};

const modeIcons: Record<string, LucideIcon> = {
  Cash: Banknote,
  UPI: Smartphone,
  Card: CreditCard,
};

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 };

export default function PaymentsClient({
  memberId,
  member: initialMember,
  payments: initialPayments,
  plans = [],
  gymUserId,
  gymName,
}: {
  memberId: string;
  member?: ApiMember;
  payments?: ApiPayment[];
  plans?: { id: string; name: string; price: number; durationDays: number }[];
  gymUserId: string;
  gymName?: string;
}) {
  const router = useRouter();
  const [showPayForm, setShowPayForm] = useState(false);
  const [payments, setPayments] = useState<ApiPayment[]>(initialPayments ?? []);
  const [member, setMember] = useState<ApiMember | null>(initialMember ?? null);
  const [successOverlay, setSuccessOverlay] = useState<{
    memberName: string;
    amount: number;
    mode: string;
    phone: string;
    createdAt: string;
    memberId: string;
  } | null>(null);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [payPlanId, setPayPlanId] = useState("");
  const [payPlanOpen, setPayPlanOpen] = useState(false);
  const payPlanRef = useRef<HTMLDivElement>(null);
  const [payAmount, setPayAmount] = useState("");
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (payPlanRef.current && !payPlanRef.current.contains(e.target as Node)) {
        setPayPlanOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateEndDate = useCallback((planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return "";
    const end = new Date();
    const months = Math.round(plan.durationDays / 30);
    const day = end.getDate();
    end.setDate(1);
    end.setMonth(end.getMonth() + months);
    const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    end.setDate(Math.min(day, lastDay));
    return end.toISOString().split("T")[0];
  }, [plans]);

  const [payError, payDispatch, payPending] = useActionState(
    async (_: string | null, formData: FormData) => {
      formData.set("memberId", memberId);
      try {
        const newPayment = await logPayment(formData);
        setPayments((prev) => [newPayment, ...prev]);
        setMember((prev) => (prev ? { ...prev, status: "Active" } : prev));
        setShowPayForm(false);
        const name = member?.firstName ?? "";
        if (member) {
          setSuccessOverlay({
            memberName: name.trim(),
            amount: Number(formData.get("amount")),
            mode: formData.get("mode") as string,
            phone: member.phone,
            createdAt: new Date().toISOString(),
            memberId,
          });
        }
        router.refresh();
      } catch (e) {
        return formatError(e);
      }
      return null;
    },
    null,
  );

  const handlePaySuccessDone = useCallback(() => {
    setShowPayConfirm(true);
  }, []);

  function handlePaySend() {
    if (!successOverlay) return;
    const { memberName, amount, mode, phone, createdAt, memberId: mid } = successOverlay;
    const link = `${window.location.origin}/member?memberId=${mid}&gym=${gymUserId}`;
    openWhatsApp(phone, receiptMessage(memberName, amount, mode, createdAt, gymName, link));
    setSuccessOverlay(null);
    setShowPayConfirm(false);
  }

  function handlePayCancel() {
    setSuccessOverlay(null);
    setShowPayConfirm(false);
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-text-muted">Member not found.</p>
      </div>
    );
  }

  const memberName = member.firstName;

  const hasPaymentThisMonth = useMemo(() => {
    const now = new Date();
    return payments.some((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [payments]);

  return (
    <>
      <div className="space-y-3 animate-slide-up delay-2">
        {hasPaymentThisMonth ? (
          <div className="already-logged rounded-xl border border-emerald-400/20 bg-emerald-400/15 px-5 py-3.5 text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle size={16} />
            Payment already logged this month
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowPayForm(true);
              setPayPlanId("");
              setPayAmount("");
            }}
            className="flex w-full items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium text-text-primary min-h-[48px]"
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs text-primary">+</span>
            Log Payment
          </motion.button>
        )}

        <Modal open={showPayForm} onClose={() => setShowPayForm(false)}>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-4 text-lg font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Log Payment
            </h3>
            <form action={payDispatch} className="space-y-3">
              {payError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{payError}</span>
                </div>
              )}
              {plans.length > 0 && (
                <div className="relative" ref={payPlanRef}>
                  <button
                    type="button"
                    onClick={() => setPayPlanOpen(!payPlanOpen)}
                    className={`flex w-full items-center gap-3 rounded-lg bg-white/[0.04] px-4 py-3 text-sm outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 ${payPlanId ? "text-text-primary" : "text-text-muted"}`}
                  >
                    <span className="flex-1 text-left">
                      {payPlanId
                        ? plans.find((p) => p.id === payPlanId)?.name || "Select membership plan"
                        : "Select membership plan"}
                    </span>
                    <ChevronDown size={14} className={`shrink-0 text-text-muted transition-transform duration-200 ${payPlanOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {payPlanOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/[0.08] bg-bg-base/95 backdrop-blur-2xl shadow-2xl"
                      >
                        {plans.map((p) => {
                          const selected = payPlanId === p.id;
                          return (
                            <motion.button
                              key={p.id}
                              type="button"
                              whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                              onClick={() => {
                                setPayPlanId(p.id);
                                setPayAmount(String(p.price));
                                setPayPlanOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                selected
                                  ? "bg-primary/15 text-primary"
                                  : "text-text-secondary hover:text-text-primary"
                              }`}
                            >
                              <span className="flex-1 text-left">{p.name}</span>
                              <span className="text-text-muted">₹{p.price.toLocaleString("en-IN")}</span>
                              {selected && <Check size={14} className="shrink-0 text-primary" />}
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <input type="hidden" name="planId" value={payPlanId} required />
                  <input type="hidden" name="endDate" value={calculateEndDate(payPlanId)} />
                </div>
              )}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted pointer-events-none">₹</span>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded-lg bg-white/[0.04] py-3 pl-8 pr-4 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
                />
              </div>
              {payPlanId && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-medium text-amber-400/90 px-1 flex items-center gap-1.5"
                >
                  <span className="inline-block size-1.5 rounded-full bg-amber-400/60" />
                  Membership ends {new Date(calculateEndDate(payPlanId)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </motion.p>
              )}
              <Select
                name="mode"
                required
                placeholder="Select mode"
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "UPI", label: "UPI" },
                  { value: "Card", label: "Card" },
                ]}
              />
              <div className="flex gap-2 pt-1">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={payPending}
                  className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-white disabled:opacity-50 min-h-[48px]"
                >
                  {payPending ? "Saving..." : "Record Payment"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setShowPayForm(false)}
                  className="rounded-lg bg-white/[0.06] px-4 py-3 text-sm text-text-muted min-h-[48px]"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </div>
        </Modal>

        {payments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springGentle }}
            className="glass-card rounded-xl p-6 text-center text-sm text-text-secondary"
          >
            No payments recorded yet.
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          {payments.map((payment, i) => {
            const ModeIcon = modeIcons[payment.mode] || modeIcons.Cash;
            return (
              <motion.div
                key={payment.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ...springGentle, delay: 0.2 + i * 0.04 }}
                className="glass-card flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl p-4"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    payment.status === "Paid"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {payment.status === "Paid" ? (
                    <CheckCircle size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                </div>
                <p className="text-sm font-medium text-text-primary">
                  <IndianRupee size={13} className="inline -ml-0.5 mr-0.5" />
                  {payment.amount.toLocaleString("en-IN")}
                </p>
                <span className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                  {payment.status}
                </span>
                <div className="flex w-full items-center gap-2 text-[11px] text-text-muted">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const link = `${window.location.origin}/member?memberId=${memberId}&gym=${gymUserId}`;
                      openWhatsApp(
                        member.phone,
                        receiptMessage(memberName, payment.amount, payment.mode, payment.createdAt.toString(), gymName, link),
                      );
                    }}
                    className="shrink-0 rounded-lg bg-secondary/10 px-2 py-1 text-[10px] font-medium text-secondary"
                  >
                    Send Receipt
                  </motion.button>
                  <span className="flex items-center gap-1">
                    <ModeIcon size={11} />
                    {payment.mode}
                  </span>
                  <span className="ml-auto">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {successOverlay && !showPayConfirm && (
        <SuccessOverlay
          title="Payment Successful!"
          onDone={handlePaySuccessDone}
        />
      )}

      {showPayConfirm && successOverlay && (
        <WhatsAppConfirmModal
          title="Send Receipt?"
          description="Send payment receipt to the member's WhatsApp?"
          onSend={handlePaySend}
          onCancel={handlePayCancel}
        />
      )}
    </>
  );
}
