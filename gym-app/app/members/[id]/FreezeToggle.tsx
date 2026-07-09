"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Snowflake, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { freezeMember, unfreezeMember } from "@/lib/actions/members";
import { formatError } from "@/lib/actions/helpers";

export default function FreezeToggle({
  memberId,
  status: initialStatus,
}: {
  memberId: string;
  status: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const isFrozen = status === "Frozen";

  const [error, dispatch, pending] = useActionState(
    async (_: string | null, formData: FormData) => {
      formData.set("memberId", memberId);
      const action = formData.get("_action") as string;
      try {
        if (action === "unfreeze") {
          await unfreezeMember(formData);
        } else {
          await freezeMember(formData);
        }
        setStatus(action === "unfreeze" ? "Active" : "Frozen");
        router.refresh();
      } catch (e) {
        return formatError(e);
      }
      return null;
    },
    null,
  );

  return (
    <form action={dispatch} className="flex-1">
      <input type="hidden" name="_action" value={isFrozen ? "unfreeze" : "freeze"} />
      {error && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <motion.button
        type="submit"
        disabled={pending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium disabled:opacity-50 min-h-[48px] ${
          isFrozen
            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
            : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
        }`}
      >
        <Snowflake size={16} />
        {pending ? "Saving..." : isFrozen ? "Unfreeze" : "Freeze"}
      </motion.button>
    </form>
  );
}
