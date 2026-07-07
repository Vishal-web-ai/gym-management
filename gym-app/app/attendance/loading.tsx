export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-white/5" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-white/5" />
      </div>
      <div className="flex items-center gap-2">
        <div className="size-8 animate-pulse rounded-lg bg-white/5" />
        <div className="h-6 w-40 animate-pulse rounded bg-white/5" />
        <div className="size-8 animate-pulse rounded-lg bg-white/5" />
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-white/5" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
              <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
