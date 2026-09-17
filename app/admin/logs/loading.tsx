export default function AdminLogsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-4 h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-6 h-8 w-44 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

      {/* Filter skeleton */}
      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex gap-3">
          <div className="h-11 flex-1 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-11 flex-1 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-11 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <div className="flex gap-2">
          <div className="h-11 flex-1 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-11 w-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-11 w-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-zinc-100 px-4 py-3 last:border-0 dark:border-zinc-900"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 flex-1 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
