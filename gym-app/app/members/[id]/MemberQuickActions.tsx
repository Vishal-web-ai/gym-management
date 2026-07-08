"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { MessageCircleMore, Trash2, AlertCircle, LogIn } from "lucide-react";
import { deleteMember } from "@/lib/actions/members";
import { formatError } from "@/lib/actions/helpers";
import { openWhatsApp, reminderMessage, checkInLinkMessage } from "@/lib/whatsapp";
import ConfirmDialog from "@/components/ConfirmDialog";

const springBtn = { type: "spring" as const, stiffness: 300, damping: 20 };

export default function MemberQuickActions({
  memberId,
  phone,
  memberName,
  status,
  gymUserId,
  gymName,
}: {
  memberId: string;
  phone: string;
  memberName: string;
  status: string;
  gymUserId: string;
  gymName?: string;
}) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const [deleteError, deleteAction, deletePending] = useActionState(
    async (_: string | null) => {
      try {
        await deleteMember(memberId);
        router.push("/members");
      } catch (e) {
        return formatError(e);
      }
      return null;
    },
    null,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.25 }}
      className="mt-4 border-t border-white/[0.06] pt-4"
    >
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openWhatsApp(phone, reminderMessage(memberName, status, gymName))}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-3 text-sm font-medium text-amber-400 hover:bg-amber-500/20 min-h-[48px]"
        >
          <MessageCircleMore size={18} />
          Remind
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            openWhatsApp(
              phone,
              checkInLinkMessage(
                memberName,
                memberId,
                gymUserId,
                window.location.origin,
                gymName,
              ),
            )
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-medium text-primary hover:bg-primary/20 min-h-[48px]"
        >
          <LogIn size={18} />
          Check-in Link
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowDelete(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 py-3 text-sm text-red-400 hover:bg-red-500/5 min-h-[48px]"
        >
          <Trash2 size={16} />
          Delete
        </motion.button>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title={`Delete ${memberName}?`}
        description="This will permanently remove their profile, payment history, and attendance records. This action cannot be undone."
        variant="danger"
        hideActions
      >
        {deleteError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{deleteError}</span>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setShowDelete(false)}
            className="flex-1 rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-text-primary hover:bg-white/[0.1] min-h-[48px]"
          >
            Cancel
          </button>
          <form action={deleteAction} className="flex-1">
            <motion.button
              type="submit"
              disabled={deletePending}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-xl bg-red-500 py-3 text-sm font-medium text-white disabled:opacity-50 min-h-[48px]"
            >
              {deletePending ? "Deleting..." : "Delete"}
            </motion.button>
          </form>
        </div>
      </ConfirmDialog>
    </motion.div>
  );
}
