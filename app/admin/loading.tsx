export default function AdminDashboardLoading() {
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      <div className="mb-6 h-8 w-52 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

      {/* Stat card skeletons */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Filter skeleton */}
      <div className="mb-6 h-20 w-full animate-pulse rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" />

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-zinc-100 px-4 py-3 last:border-0 dark:border-zinc-900"
          >
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 flex-1 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
