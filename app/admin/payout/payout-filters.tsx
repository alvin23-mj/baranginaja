"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PayoutStatus } from "@/lib/types/database";

const STATUS_OPTIONS: { value: PayoutStatus | ""; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "menunggu", label: "Menunggu" },
  { value: "dicairkan", label: "Dicairkan" },
];

export function PayoutFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/payout?${params.toString()}`);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParam("q", search.trim());
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row">
      <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
        <input
          suppressHydrationWarning
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama penjual atau nama barang..."
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
        />
        <button
          suppressHydrationWarning
          type="submit"
          className="h-10 shrink-0 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Cari
        </button>
      </form>

      <select
        suppressHydrationWarning
        value={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className="h-10 w-full shrink-0 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 sm:w-56"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
