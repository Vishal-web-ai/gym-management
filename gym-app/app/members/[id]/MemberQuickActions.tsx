"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleMore, Trash2, AlertCircle, LogIn } from "lucide-react";
import { deleteMember } from "@/lib/actions/members";
import { formatError } from "@/lib/actions/helpers";
import { openWhatsApp, reminderMessage, checkInLinkMessage } from "@/lib/whatsapp";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function MemberQuickActions({
  memberId,
  phone,
  memberName,
  status,
  gymUserId,
}: {
  memberId: string;
  phone: string;
  memberName: string;
  status: string;
  gymUserId: string;
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
    <div className="mt-4 border-t border-white/[0.06] pt-4">
      <div className="flex gap-3">
        <button
          onClick={() => openWhatsApp(phone, reminderMessage(memberName, status))}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-3 text-sm font-medium text-amber-400 transition-all duration-200 hover:bg-amber-500/20 active:scale-[0.98] min-h-[48px]"
        >
          <MessageCircleMore size={18} />
          Remind
        </button>
        <button
          onClick={() =>
            openWhatsApp(
              phone,
              checkInLinkMessage(
                memberName,
                memberId,
                gymUserId,
                window.location.origin,
              ),
            )
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/20 active:scale-[0.98] min-h-[48px]"
        >
          <LogIn size={18} />
          Check-in Link
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 py-3 text-sm text-red-400 transition-all duration-200 hover:bg-red-500/5 active:scale-[0.98] min-h-[48px]"
        >
          <Trash2 size={16} />
          Delete
        </button>
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
            className="flex-1 rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.1] min-h-[48px]"
          >
            Cancel
          </button>
          <form action={deleteAction} className="flex-1">
            <button
              type="submit"
              disabled={deletePending}
              className="w-full rounded-xl bg-red-500 py-3 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
            >
              {deletePending ? "Deleting..." : "Delete"}
            </button>
          </form>
        </div>
      </ConfirmDialog>
    </div>
  );
}
