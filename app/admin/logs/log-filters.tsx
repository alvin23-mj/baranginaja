"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

interface AdminOption {
  id: string;
  nama_lengkap: string;
}

export function LogFilters({ admins }: { admins: AdminOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchAksi, setSearchAksi] = useState(
    searchParams.get("aksi") ?? ""
  );

  function applyParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    // Reset to page 1 when filters change
    params.delete("page");
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/admin/logs?${params.toString()}`);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyParams({ aksi: searchAksi.trim() });
  }

  function handleReset() {
    setSearchAksi("");
    router.push("/admin/logs");
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Row 1: Date range + Admin dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2">
          <label
            htmlFor="dari"
            className="shrink-0 text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            Dari
          </label>
          <input
            suppressHydrationWarning
            id="dari"
            type="date"
            defaultValue={searchParams.get("dari") ?? ""}
            onChange={(e) => applyParams({ dari: e.target.value })}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
          />
        </div>
        <div className="flex flex-1 items-center gap-2">
          <label
            htmlFor="sampai"
            className="shrink-0 text-sm font-medium text-zinc-600 dark:text-zinc-400"
          >
            Sampai
          </label>
          <input
            suppressHydrationWarning
            id="sampai"
            type="date"
            defaultValue={searchParams.get("sampai") ?? ""}
            onChange={(e) => applyParams({ sampai: e.target.value })}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
          />
        </div>
        {admins.length > 1 && (
          <select
            suppressHydrationWarning
            defaultValue={searchParams.get("admin") ?? ""}
            onChange={(e) => applyParams({ admin: e.target.value })}
            className="h-10 w-full shrink-0 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 sm:w-48"
          >
            <option value="">Semua Admin</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama_lengkap}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Row 2: Search aksi + Reset */}
      <div className="flex gap-2">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <input
            suppressHydrationWarning
            type="text"
            value={searchAksi}
            onChange={(e) => setSearchAksi(e.target.value)}
            placeholder="Cari jenis aksi..."
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
        <button
          suppressHydrationWarning
          type="button"
          onClick={handleReset}
          className="h-10 shrink-0 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
