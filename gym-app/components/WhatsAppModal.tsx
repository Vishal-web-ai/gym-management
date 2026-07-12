"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export default function WhatsAppModal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [touched, setTouched] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setName("");
    setAge("");
    setContact("");
    setTouched(false);
  }, []);

  const submit = useCallback(() => {
    setTouched(true);
    if (!name.trim() || !age.trim() || !contact.trim()) return;
    const text = `Hi, I am ${name.trim()}, age ${age}. Contact: ${contact.trim()}. I want to start a free trial at Rajoria Fitness Point`;
    window.open(
      `https://wa.me/919310517607?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
    close();
  }, [name, age, contact, close]);

  return (
    <>
      <span
        className={className}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
      >
        {children}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-5"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#0c0a08] p-8 shadow-2xl"
            >
              <button
                onClick={close}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <h3
                className="text-[18px] font-black uppercase text-white tracking-wide"
                style={{ fontFamily: '"Spy Agency", system-ui, sans-serif' }}
              >
                START YOUR FREE TRIAL
              </h3>
              <p
                className="mt-2 text-[13px] text-white/40 leading-relaxed"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                Fill in your details and we&apos;ll get you started on WhatsApp
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`bg-white/5 border text-white/80 rounded-xl px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-white/20 focus:border-[#ff6a00]/60 ${
                    touched && !name.trim()
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                />
                <input
                  type="number"
                  placeholder="Your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={`bg-white/5 border text-white/80 rounded-xl px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-white/20 focus:border-[#ff6a00]/60 ${
                    touched && !age.trim()
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                />
                <input
                  type="tel"
                  placeholder="Contact number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={`bg-white/5 border text-white/80 rounded-xl px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-white/20 focus:border-[#ff6a00]/60 ${
                    touched && !contact.trim()
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                />
              </div>

              <button
                onClick={submit}
                className="mt-5 flex items-center justify-center h-[48px] w-full rounded-xl bg-[#ff6a00] text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#ff6a00]/25"
              >
                CONTINUE ON WHATSAPP
              </button>

              <button
                onClick={close}
                className="mt-3 w-full text-center text-[13px] text-white/30 hover:text-white/50 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
