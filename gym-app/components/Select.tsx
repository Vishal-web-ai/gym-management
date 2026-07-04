"use client";

import { useState, useRef, useEffect } from "react";
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

  const displayLabel = selected
    ? options.find((o) => o.value === selected)?.label ?? selected
    : placeholder ?? "Select...";

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3.5 text-sm outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06] min-h-[48px] active:scale-[0.98] ${
          selected ? "text-text-primary" : "text-text-muted"
        } ${className}`}
      >
        {displayLabel}
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-bg-base py-1 shadow-xl shadow-black/40 animate-slide-down">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
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
        </div>
      )}
    </div>
  );
}
