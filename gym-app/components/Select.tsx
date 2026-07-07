"use client";

import { useState, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
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
  const [pos, setPos] = useState<{ top: number; left: number; width: number; upward: boolean } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const uid = useId();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        const menu = document.getElementById(`select-menu-${uid}`);
        if (menu && !menu.contains(e.target as Node)) {
          setOpen(false);
        } else if (!menu) {
          setOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [uid]);

  useEffect(() => {
    function handleScroll() {
      if (open) setOpen(false);
    }
    if (open) {
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [open]);

  function toggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedHeight = options.length * 40 + 16;
      setPos({
        top: spaceBelow < estimatedHeight ? rect.top - 8 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        upward: spaceBelow < estimatedHeight,
      });
    }
    setOpen(!open);
  }

  const displayLabel = selected
    ? options.find((o) => o.value === selected)?.label ?? selected
    : placeholder ?? "Select...";

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selected} />
      <button
        ref={btnRef}
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
      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          id={`select-menu-${uid}`}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
          }}
          className="overflow-hidden rounded-xl border border-white/[0.08] bg-bg-base py-1 shadow-xl shadow-black/40"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={() => {
                setSelected(opt.value);
                onChange?.(opt.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.06] ${
                selected === opt.value
                  ? "text-primary font-medium"
                  : "text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
