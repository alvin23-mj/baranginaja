export default function ProdukDetailLoading() {
  return (
    <div className="mx-auto grid w-full max-w-4xl animate-pulse grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2">
      <div className="aspect-square w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex flex-col gap-3">
        <div className="h-7 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-6 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-24 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-11 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
