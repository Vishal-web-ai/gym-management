"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

type Option = { value: string; label: string };

export default function Select({
  name,
  value,
  onChange,
  options,
  placeholder,
  required,
  className = "",
}: {
  name: string;
  value?: string;
  onChange?: (v: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value ?? "");
  const [upward, setUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle() {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedHeight = options.length * 40 + 20;
      setUpward(spaceBelow < estimatedHeight);
    }
    setOpen(!open);
  }

  const displayLabel = selected
    ? options.find((o) => o.value === selected)?.label ?? selected
    : placeholder ?? "Select...";

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        onClick={toggle}
        className={`flex w-full items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06] min-h-[48px] ${
          selected ? "text-text-primary" : "text-text-muted"
        } ${className}`}
      >
        {displayLabel}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ChevronDown size={16} className="text-text-muted" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: upward ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: upward ? 4 : -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute z-50 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-bg-base py-1 shadow-xl shadow-black/40 ${
              upward ? "bottom-full mb-1" : "mt-1"
            }`}
          >
            {options.map((opt) => (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSelected(opt.value);
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  selected === opt.value
                    ? "text-primary font-medium"
                    : "text-text-primary"
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
