export default function AdminProductsLoading() {
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 h-4 w-36 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-56 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-10 w-44 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Cards skeleton */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 h-3 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-7 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
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
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-40 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 flex-1 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
