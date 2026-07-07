"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createMemberWithPayment } from "@/lib/actions/members";
import { getPlans } from "@/lib/actions/plans";
import { getGymConfig } from "@/lib/actions/settings";
import { formatError } from "@/lib/actions/helpers";
import { openWhatsApp, welcomeMessage, receiptMessage } from "@/lib/whatsapp";
import MemberForm from "../MemberForm";
import SuccessOverlay from "@/components/SuccessOverlay";
import WhatsAppConfirmModal from "@/components/WhatsAppConfirmModal";

export default function NewMemberPage() {
  const [plans, setPlans] = useState<{ id: string; name: string; price: number }[]>([]);
  const [gymName, setGymName] = useState<string>();

  useEffect(() => {
    getPlans().then(setPlans).catch(() => {});
    getGymConfig().then((c) => c?.gymName && setGymName(c.gymName)).catch(() => {});
  }, []);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [doneData, setDoneData] = useState<{ phone: string; name: string; amount: number; mode: string; memberId: string; gymUserId: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, dispatch, isPending] = useActionState(
    async (_: string | null, formData: FormData) => {
      try {
        const { member, payment } = await createMemberWithPayment(formData);
        const phone = (formData.get("phone") as string).replace(/[\s\-\(\)]/g, "");
        const firstName = formData.get("firstName") as string;
        setDoneData({ phone, name: firstName, amount: payment.amount, mode: payment.mode, memberId: member.id, gymUserId: member.userId });
      } catch (e) {
        return formatError(e);
      }
      return null;
    },
    null,
  );

  function handleDone() {
    setShowConfirm(true);
  }

  function goToMembers() {
    queryClient.invalidateQueries({ queryKey: ["members"] });
    router.push("/members");
  }

  function handleSend() {
    if (!doneData) return;
    const { phone, name, amount, mode, memberId, gymUserId } = doneData;
    const link = `${window.location.origin}/member?memberId=${memberId}&gym=${gymUserId}`;
    openWhatsApp(phone, welcomeMessage(name, new Date().toISOString(), gymName, link));
    openWhatsApp(phone, receiptMessage(name, amount, mode, new Date().toISOString(), gymName, link));
    setDoneData(null);
    setShowConfirm(false);
    goToMembers();
  }

  function handleCancel() {
    setDoneData(null);
    setShowConfirm(false);
    goToMembers();
  }

  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-display)" }}>Add Member</h1>
      <div className="glass-card rounded-xl p-5">
        <MemberForm action={dispatch} submitLabel={isPending ? "Saving..." : "Add Member"} showPayment plans={plans} />
      </div>
      {error && (
        <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {doneData && !showConfirm && (
        <SuccessOverlay title="Member Added Successfully!" onDone={handleDone} />
      )}

      {showConfirm && doneData && (
        <WhatsAppConfirmModal
          title="Send to WhatsApp?"
          description="Send welcome kit and payment receipt to the member's WhatsApp?"
          onSend={handleSend}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
