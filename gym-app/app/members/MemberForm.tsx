"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus, Banknote, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import Select from "@/components/Select";
import { formatError } from "@/lib/actions/helpers";
import ImageUpload from "@/components/ImageUpload";

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileHover={{ scale: 1.02, transition: { ...spring } }}
      whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-medium text-white disabled:opacity-50 min-h-[48px] shadow-lg shadow-primary/20"
    >
      <UserPlus size={18} />
      {pending ? "Saving..." : label}
    </motion.button>
  );
}

export default function MemberForm({
  action,
  submitLabel,
  defaultValues,
  showPayment,
  plans = [],
}: {
  action: (formData: FormData) => Promise<unknown> | void;
  submitLabel: string;
  showPayment?: boolean;
  plans?: { id: string; name: string; price: number; durationDays?: number }[];
  defaultValues?: {
    id?: string;
    firstName?: string;
    phone?: string;
    address?: string;
    status?: string;
    gender?: string;
    endDate?: string;
    planId?: string;
    image?: string | null;
  };
}) {
  const [error, dispatch] = useActionState(
    async (_: string | null, formData: FormData) => {
      try {
        await action(formData);
      } catch (e) {
        if (
          e instanceof Error &&
          "digest" in e &&
          typeof e.digest === "string" &&
          e.digest.startsWith("NEXT_REDIRECT")
        ) {
          throw e;
        }
        return formatError(e);
      }
      return null;
    },
    null,
  );

  const [selectedPlanId, setSelectedPlanId] = useState(defaultValues?.planId ?? "");
  const [endDate, setEndDate] = useState(
    defaultValues?.endDate ? new Date(defaultValues.endDate).toISOString().split("T")[0] : "",
  );
  const [amount, setAmount] = useState("");

  function handlePlanChange(planId: string) {
    setSelectedPlanId(planId);
    if (!planId) return;
    const plan = plans.find((p) => p.id === planId);
    if (plan?.durationDays) {
      const date = new Date();
      date.setMonth(date.getMonth() + Math.round(plan.durationDays / 30));
      setEndDate(date.toISOString().split("T")[0]);
    }
    if (plan?.price) {
      setAmount(String(plan.price));
    }
  }

  return (
    <form action={dispatch} className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring }}
          className="flex items-start gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <ImageUpload defaultValue={defaultValues?.image} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          First Name
        </label>
        <input
          name="firstName"
          required
          defaultValue={defaultValues?.firstName}
          className="w-full rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Gender
        </label>
        <Select
          name="gender"
          value={defaultValues?.gender ?? ""}
          placeholder="Select gender"
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
          ]}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Phone</label>
        <input
          name="phone"
          type="tel"
          required
          defaultValue={defaultValues?.phone}
          className="w-full rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Address <span className="text-text-muted">(optional)</span>
        </label>
        <input
          name="address"
          defaultValue={defaultValues?.address}
          placeholder="Street, city, pincode..."
          className="w-full rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
        />
      </div>

      {plans.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Membership Plan
          </label>
          <Select
            name="planId"
            value={selectedPlanId}
            onChange={handlePlanChange}
            placeholder="Select plan"
            options={plans.map((p) => ({
              value: p.id,
              label: `${p.name} — ₹${p.price.toLocaleString("en-IN")}${p.durationDays ? ` (${p.durationDays / 30}mo)` : ""}`,
            }))}
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Membership End Date
        </label>
        <input
          name="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm text-text-primary outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
        />
      </div>

      {showPayment && (
        <>
          <div className="border-t border-white/[0.06] pt-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Banknote size={16} />
              Initial Payment
            </p>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Amount"
                  autoComplete="off"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Mode
                </label>
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
              </div>
            </div>
          </div>
        </>
      )}

      {defaultValues?.status && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Status
          </label>
          <Select
            name="status"
            value={defaultValues.status}
            options={[
              { value: "Active", label: "Active" },
              { value: "Overdue", label: "Overdue" },
              { value: "Frozen", label: "Frozen" },
              { value: "Expired", label: "Expired" },
            ]}
          />
        </div>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
