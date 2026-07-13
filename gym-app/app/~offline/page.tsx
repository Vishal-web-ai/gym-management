import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/[0.06]">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-muted"
        >
          <path d="M12 2a10 10 0 1 0 10 10" />
          <path d="M12 6v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="M20 12h-2" />
          <path d="m19.07 4.93-1.41 1.41" />
          <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" />
          <path d="M13 22h7" />
          <path d="M10 22v-6" />
        </svg>
      </div>
      <h1 className="font-display text-xl font-semibold text-text-primary">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-xs text-sm text-text-muted">
        Please check your internet connection and try again.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
      >
        Go Home
      </Link>
    </main>
  );
}
