export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-28 animate-pulse rounded-lg bg-white/5" />
          <div className="h-4 w-20 animate-pulse rounded bg-white/5" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-white/5" />
      </div>
      <div className="h-10 w-64 animate-pulse rounded-lg bg-white/5" />
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
