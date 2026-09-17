"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Campus, Category, ProductCondition } from "@/lib/types/database";

const KONDISI_OPTIONS: ProductCondition[] = [
  "Baru",
  "Bekas - Layak Pakai",
  "Bekas - Ada Cacat Minor",
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "harga_asc", label: "Harga Terendah" },
  { value: "harga_desc", label: "Harga Tertinggi" },
];

interface DistrictOption {
  id: string | number;
  nama_kecamatan?: string;
  nama_kampus?: string;
}

export function ProductFilters({
  categories,
  districts,
  campuses,
}: {
  categories: Category[];
  districts?: DistrictOption[];
  campuses?: Campus[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const districtList: { id: string | number; name: string }[] =
    districts && districts.length > 0
      ? districts.map((d) => ({
          id: d.id,
          name: d.nama_kecamatan || d.nama_kampus || String(d.id),
        }))
      : campuses && campuses.length > 0
      ? campuses.map((c) => ({
          id: c.id,
          name: c.nama_kampus,
        }))
      : [];

  const selectedDistrict =
    searchParams.get("kecamatan") ?? searchParams.get("kampus") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Clean up legacy param
    if (key === "kecamatan") {
      params.delete("kampus");
    }
    params.delete("page");
    router.push(`/produk?${params.toString()}`);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParam("q", search.trim());
  }

  const hasActiveFilters = Boolean(
    search ||
      searchParams.get("kategori") ||
      selectedDistrict ||
      searchParams.get("kondisi") ||
      (searchParams.get("sort") && searchParams.get("sort") !== "terbaru")
  );

  function resetAllFilters() {
    setSearch("");
    router.push("/produk");
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white/95 p-3.5 sm:p-4.5 shadow-lg shadow-zinc-900/5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari barang bekas, kos, elektronik, buku, perabot..."
            className="h-10.5 sm:h-11 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/70 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-zinc-950 focus:bg-white focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-50 dark:focus:border-white"
          />
        </div>
        <button
          type="submit"
          className="h-10.5 sm:h-11 shrink-0 cursor-pointer rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-98 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Cari
        </button>
      </form>

      {/* Select Filters Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
        <select
          value={searchParams.get("kategori") ?? ""}
          onChange={(e) => updateParam("kategori", e.target.value)}
          aria-label="Filter Kategori"
          className="h-10 w-full cursor-pointer truncate rounded-xl border border-zinc-200/90 bg-zinc-50/70 px-3 text-[13px] sm:text-sm text-zinc-800 outline-none transition-all focus:border-zinc-950 focus:bg-white focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
        >
          <option value="">Semua Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nama_kategori}
            </option>
          ))}
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => updateParam("kecamatan", e.target.value)}
          aria-label="Filter Kecamatan"
          className="h-10 w-full cursor-pointer truncate rounded-xl border border-zinc-200/90 bg-zinc-50/70 px-3 text-[13px] sm:text-sm text-zinc-800 outline-none transition-all focus:border-zinc-950 focus:bg-white focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
        >
          <option value="">Semua Kecamatan</option>
          {districtList.map((d) => (
            <option key={d.id} value={d.id}>
              Kec. {d.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("kondisi") ?? ""}
          onChange={(e) => updateParam("kondisi", e.target.value)}
          aria-label="Filter Kondisi"
          className="h-10 w-full cursor-pointer truncate rounded-xl border border-zinc-200/90 bg-zinc-50/70 px-3 text-[13px] sm:text-sm text-zinc-800 outline-none transition-all focus:border-zinc-950 focus:bg-white focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
        >
          <option value="">Semua Kondisi</option>
          {KONDISI_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("sort") ?? "terbaru"}
          onChange={(e) => updateParam("sort", e.target.value)}
          aria-label="Urutkan Produk"
          className="h-10 w-full cursor-pointer truncate rounded-xl border border-zinc-200/90 bg-zinc-50/70 px-3 text-[13px] sm:text-sm text-zinc-800 outline-none transition-all focus:border-zinc-950 focus:bg-white focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-950 hover:underline transition-colors dark:text-zinc-400 dark:hover:text-white cursor-pointer"
          >
            Hapus Semua Filter &times;
          </button>
        </div>
      )}
    </div>
  );
}
