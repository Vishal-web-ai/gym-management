"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type ProfilePhotoProps = {
  image?: string | null;
  name: string;
  className?: string;
  textClassName?: string;
};

export default function ProfilePhoto({
  image,
  name,
  className = "size-12",
  textClassName = "text-base",
}: ProfilePhotoProps) {
  const [open, setOpen] = useState(false);
  const initial = name.trim()[0]?.toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const baseClass = `flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-subtle font-bold text-primary ring-1 ring-white/[0.08]`;

  if (!image) {
    return (
      <div className={`${baseClass} ${textClassName}`} aria-label={`${name} profile photo`}>
        {initial}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label={`View ${name} profile photo`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={`${baseClass} cursor-zoom-in transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/60`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${name} profile photo`}
          className="h-full w-full object-cover"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} profile photo preview`}
          onClick={() => setOpen(false)}
        >
          <div className="flex min-h-[64px] items-center justify-between px-4 py-3">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <button
              type="button"
              aria-label="Close photo preview"
              onClick={() => setOpen(false)}
              className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <X size={22} />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`${name} profile photo full size`}
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
