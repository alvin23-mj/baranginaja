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

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama barang..."
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
        <button
          type="submit"
          className="h-10 shrink-0 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Cari
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select
          value={searchParams.get("kategori") ?? ""}
          onChange={(e) => updateParam("kategori", e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
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
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        >
          <option value="">Semua Kecamatan (Surabaya)</option>
          {districtList.map((d) => (
            <option key={d.id} value={d.id}>
              Kec. {d.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("kondisi") ?? ""}
          onChange={(e) => updateParam("kondisi", e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
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
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
