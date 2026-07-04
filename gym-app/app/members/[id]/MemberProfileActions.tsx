"use client";

import { MessageCircleMore } from "lucide-react";
import { openWhatsApp, reminderMessage } from "@/lib/whatsapp";

export default function MemberProfileActions({
  phone,
  memberName,
  status,
}: {
  phone: string;
  memberName: string;
  status: string;
}) {
  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={() => openWhatsApp(phone, `Hi ${memberName}!`)}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500/10 py-2.5 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20 min-h-[44px]"
      >
        <MessageCircleMore size={16} />
        WhatsApp
      </button>
      <button
        onClick={() => openWhatsApp(phone, reminderMessage(memberName, status))}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500/10 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20 min-h-[44px]"
      >
        <MessageCircleMore size={16} />
        Remind
      </button>
    </div>
  );
}
