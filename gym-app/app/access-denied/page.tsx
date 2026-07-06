import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-500/10">
          <ShieldX size={32} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Access Denied
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          You do not have permission to access this page. If you believe this is a mistake, please contact the gym owner.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:opacity-90"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
