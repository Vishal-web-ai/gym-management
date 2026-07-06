export default function Loading() {
  return (
    <div className="space-y-6 p-4">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-white/5" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}
