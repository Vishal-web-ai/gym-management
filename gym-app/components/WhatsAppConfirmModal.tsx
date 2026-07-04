"use client";

import { MessageCircleMore, X } from "lucide-react";

export default function WhatsAppConfirmModal({
  title,
  description,
  onSend,
  onCancel,
}: {
  title: string;
  description: string;
  onSend: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
            <MessageCircleMore size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
          <p className="mt-2 text-sm text-text-secondary">{description}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-text-muted transition-colors hover:text-text-primary min-h-[48px]"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-700 min-h-[48px]"
            >
              <MessageCircleMore size={18} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
