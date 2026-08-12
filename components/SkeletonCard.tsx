export function SkeletonCard() {
  return (
    <div
      className="overflow-hidden rounded-card border border-neutral-100 bg-white shadow-sm motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="aspect-[4/3] w-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:800px_100%] animate-shimmer" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 rounded bg-neutral-200" />
        <div className="h-3 w-1/2 rounded bg-neutral-100" />
      </div>
    </div>
  );
}
