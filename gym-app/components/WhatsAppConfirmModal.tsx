"use client";

import { MessageCircleMore } from "lucide-react";
import { motion } from "motion/react";

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 };
const springSnappy = { type: "spring" as const, stiffness: 400, damping: 25, mass: 0.8 };

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ ...springSnappy }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass-card rounded-2xl p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...spring, delay: 0.1 }}
            className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/10"
          >
            <MessageCircleMore size={28} className="text-emerald-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
          <p className="mt-2 text-sm text-text-secondary">{description}</p>
          <div className="mt-6 flex gap-3">
            <motion.button
              onClick={onCancel}
              whileHover={{ scale: 1.02, transition: { ...spring } }}
              whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 20 } }}
              className="flex-1 rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-text-muted min-h-[48px]"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onSend}
              whileHover={{ scale: 1.02, transition: { ...spring } }}
              whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 20 } }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white min-h-[48px]"
            >
              <MessageCircleMore size={18} />
              Send
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
