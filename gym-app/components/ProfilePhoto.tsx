"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
      <motion.button
        type="button"
        aria-label={`View ${name} profile photo`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 25 } }}
        whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 20 } }}
        className={`${baseClass} cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary/60`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${name} profile photo`}
          className="h-full w-full object-cover"
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="photo-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} profile photo preview`}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="flex min-h-[64px] items-center justify-between px-4 py-3"
            >
              <p className="truncate text-sm font-medium text-white">{name}</p>
              <motion.button
                type="button"
                aria-label="Close photo preview"
                onClick={() => setOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <X size={22} />
              </motion.button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex min-h-0 flex-1 items-center justify-center px-3 pb-6"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`${name} profile photo full size`}
                className="max-h-full max-w-full rounded-lg object-contain"
                onClick={(event) => event.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
