export default function AdminPayoutLoading() {
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />

      {/* Cards skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 h-3 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-7 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Filter skeleton */}
      <div className="mb-6 h-16 w-full animate-pulse rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900" />

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="h-4 w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-zinc-200 px-4 py-3.5 last:border-0 dark:border-zinc-800"
          >
            <div className="h-4 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-36 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 flex-1 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
