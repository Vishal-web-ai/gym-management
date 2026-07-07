export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-8 w-24 animate-pulse rounded-lg bg-white/5" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="h-10 w-28 animate-pulse rounded-lg bg-white/5" />
    </div>
  );
}
