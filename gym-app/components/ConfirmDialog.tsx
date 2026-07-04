"use client";

import { type ReactNode } from "react";
import {
  AlertTriangle,
  Trash2,
  CheckCircle,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import Modal from "./Modal";

type Variant = "danger" | "warning" | "success" | "info";

const variantConfig: Record<
  Variant,
  { icon: LucideIcon; iconBg: string; iconColor: string; confirmBg: string; confirmHover: string }
> = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    confirmBg: "bg-red-500",
    confirmHover: "hover:opacity-90",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    confirmBg: "bg-amber-500",
    confirmHover: "hover:opacity-90",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    confirmBg: "bg-emerald-600",
    confirmHover: "hover:bg-emerald-700",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    confirmBg: "bg-primary",
    confirmHover: "hover:opacity-90",
  },
};

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  variant?: Variant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  hideActions?: boolean;
  children?: ReactNode;
};

export default function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  variant = "warning",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  hideActions = false,
  children,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  function handleCancel() {
    onCancel?.();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleCancel}>
      <div className="glass-card rounded-2xl p-6">
        <div className="flex justify-end -mt-2 -mr-2">
          <button
            onClick={handleCancel}
            className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-full ${config.iconBg}`}>
          <Icon size={28} className={config.iconColor} />
        </div>
        <h3 className="text-center text-lg font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h3>
        <p className="mt-2 text-center text-sm text-text-secondary">{description}</p>

        {children && <div className="mt-4">{children}</div>}

        {!hideActions && <div className="mt-6 flex gap-3">
          {onConfirm ? (
            <>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.1] min-h-[48px] disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 rounded-xl ${config.confirmBg} py-3 text-sm font-medium text-white transition-all duration-200 ${config.confirmHover} active:scale-[0.98] disabled:opacity-50 min-h-[48px]`}
              >
                {loading ? `${confirmLabel}...` : confirmLabel}
              </button>
            </>
          ) : (
            <button
              onClick={handleCancel}
              className="flex-1 rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.1] min-h-[48px]"
            >
              {cancelLabel}
            </button>
          )}
        </div>}
      </div>
    </Modal>
  );
}
