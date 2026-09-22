"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatRupiah } from "@/lib/pricing";
import type { Category, UserRow } from "@/lib/types/database";
import {
  type AdminProductListItem,
  ProductDetailModal,
  ProductCreateModal,
  ProductEditModal,
  ProductDeleteModal,
} from "./product-modals";

interface ProductManagementProps {
  initialProducts: AdminProductListItem[];
  categories: Category[];
  sellers: UserRow[];
}

const MONTH_OPTIONS = [
  { value: "", label: "Semua Bulan" },
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

import { AdminPageHeader } from "../admin-page-header";

export function ProductManagement({
  initialProducts,
  categories,
  sellers,
}: ProductManagementProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search & Filter state synced with URL
  const currentSearch = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentCategory = searchParams.get("kategori") ?? "";
  const currentBulan = searchParams.get("bulan") ?? "";

  const [search, setSearch] = useState(currentSearch);

  // Modal states
  const [detailProduct, setDetailProduct] = useState<AdminProductListItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProductListItem | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<AdminProductListItem | null>(null);

  // Calculate statistics across all current initialProducts
  const totalProducts = initialProducts.length;
  const totalTersedia = initialProducts.filter((p) => p.status === "Tersedia").length;
  const totalDipesan = initialProducts.filter((p) => p.status === "Dipesan").length;
  const totalTerjual = initialProducts.filter((p) => p.status === "Terjual").length;

  // Filter products for table display based on selected status card
  const displayedProducts = currentStatus
    ? initialProducts.filter((p) => p.status === currentStatus)
    : initialProducts;

  function updateFilters(newParams: {
    q?: string;
    status?: string;
    kategori?: string;
    bulan?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.q !== undefined) {
      if (newParams.q) params.set("q", newParams.q);
      else params.delete("q");
    }
    if (newParams.status !== undefined) {
      if (newParams.status) params.set("status", newParams.status);
      else params.delete("status");
    }
    if (newParams.kategori !== undefined) {
      if (newParams.kategori) params.set("kategori", newParams.kategori);
      else params.delete("kategori");
    }
    if (newParams.bulan !== undefined) {
      if (newParams.bulan) params.set("bulan", newParams.bulan);
      else params.delete("bulan");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ q: search });
  }

  function handleRefresh() {
    router.refresh();
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      {/* Top Header */}
      <AdminPageHeader
        title="Kelola Katalog Produk"
        subtitle="Kontrol penuh atas seluruh produk seller yang terdaftar di platform. Klik card status untuk memfilter tabel."
        backLink={{ href: "/admin", label: "Kembali ke Dashboard" }}
      />

      {/* Interactive Status Filter Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Card 1: Total Katalog (Semua) */}
        <button
          type="button"
          onClick={() => updateFilters({ status: "" })}
          className={`group text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-xs ${
            currentStatus === ""
              ? "border-zinc-950 bg-zinc-100/80 dark:border-zinc-100 dark:bg-zinc-800/80 ring-2 ring-zinc-950/20 dark:ring-zinc-100/30 scale-[1.01]"
              : "border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Katalog
            </p>
            {currentStatus === "" && (
              <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">
                Aktif
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {totalProducts}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            {currentStatus === "" ? "✓ Menampilkan Semua Status" : "Klik untuk tampilkan semua"}
          </p>
        </button>

        {/* Card 2: Status Tersedia */}
        <button
          type="button"
          onClick={() => updateFilters({ status: "Tersedia" })}
          className={`group text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-xs ${
            currentStatus === "Tersedia"
              ? "border-emerald-500 bg-emerald-50/90 dark:border-emerald-500/70 dark:bg-emerald-950/50 ring-2 ring-emerald-500/30 scale-[1.01]"
              : "border-emerald-200/70 bg-emerald-50/30 hover:border-emerald-400 hover:bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:hover:border-emerald-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Produk Tersedia
            </p>
            {currentStatus === "Tersedia" && (
              <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200">
                Aktif
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-950 dark:text-emerald-300">
            {totalTersedia}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            {currentStatus === "Tersedia" ? "✓ Filter Tersedia Aktif" : "Klik untuk filter Tersedia"}
          </p>
        </button>

        {/* Card 3: Status Dipesan */}
        <button
          type="button"
          onClick={() => updateFilters({ status: "Dipesan" })}
          className={`group text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-xs ${
            currentStatus === "Dipesan"
              ? "border-amber-500 bg-amber-50/90 dark:border-amber-500/70 dark:bg-amber-950/50 ring-2 ring-amber-500/30 scale-[1.01]"
              : "border-amber-200/70 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20 dark:hover:border-amber-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Produk Dipesan
            </p>
            {currentStatus === "Dipesan" && (
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
                Aktif
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-300">
            {totalDipesan}
          </p>
          <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80">
            {currentStatus === "Dipesan" ? "✓ Filter Dipesan Aktif" : "Klik untuk filter Dipesan"}
          </p>
        </button>

        {/* Card 4: Status Terjual */}
        <button
          type="button"
          onClick={() => updateFilters({ status: "Terjual" })}
          className={`group text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-xs ${
            currentStatus === "Terjual"
              ? "border-zinc-500 bg-zinc-100/90 dark:border-zinc-500/70 dark:bg-zinc-800/80 ring-2 ring-zinc-500/30 scale-[1.01]"
              : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-100/60 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Produk Terjual
            </p>
            {currentStatus === "Terjual" && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                Aktif
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-200">
            {totalTerjual}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            {currentStatus === "Terjual" ? "✓ Filter Terjual Aktif" : "Klik untuk filter Terjual"}
          </p>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama barang atau nama penjual..."
              suppressHydrationWarning
              className="w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            type="submit"
            suppressHydrationWarning
            className="rounded-xl border border-zinc-300 bg-zinc-100 px-3.5 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              Bulan:
            </label>
            <select
              value={currentBulan}
              onChange={(e) => updateFilters({ bulan: e.target.value })}
              suppressHydrationWarning
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              Kategori:
            </label>
            <select
              value={currentCategory}
              onChange={(e) => updateFilters({ kategori: e.target.value })}
              suppressHydrationWarning
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          {/* Tambah Produk Baru Button */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-xs shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Produk Baru</span>
          </button>

          {(currentSearch || currentStatus || currentCategory || currentBulan) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                router.push(pathname);
              }}
              className="text-xs font-medium text-red-600 hover:underline dark:text-red-400 px-1 ml-1"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Catalog Table */}
      {displayedProducts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Tidak ada produk katalog yang sesuai dengan filter {currentStatus ? `status "${currentStatus}"` : ""}.
          </p>
          {currentStatus && (
            <button
              type="button"
              onClick={() => updateFilters({ status: "" })}
              className="mt-3 text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
            >
              Tampilkan Semua Produk
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Penjual (Seller)</th>
                  <th className="px-4 py-3">Kategori & Kondisi</th>
                  <th className="px-4 py-3 text-right">Harga Modal</th>
                  <th className="px-4 py-3 text-right">Harga Jual</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {displayedProducts.map((prod) => {
                  const thumb = prod.foto_urls && prod.foto_urls.length > 0 ? prod.foto_urls[0] : null;
                  const photoCount = prod.foto_urls?.length ?? 0;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Product Thumbnail & Name */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                            {thumb ? (
                              <img src={thumb} alt={prod.nama_barang} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                                No Image
                              </div>
                            )}
                            {photoCount > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 rounded-md bg-black/70 px-1 py-0.2 text-[9px] font-bold text-white">
                                {photoCount}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-zinc-950 dark:text-zinc-100 text-sm">
                              {prod.nama_barang}
                            </p>
                            <p className="truncate text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                              {prod.deskripsi || "Tidak ada deskripsi"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Seller Info */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {prod.seller?.nama_lengkap ?? "Seller Terhapus"}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {prod.seller?.email}
                        </p>
                      </td>

                      {/* Category & Condition */}
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          {prod.kategori?.nama_kategori ?? "Umum"}
                        </span>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                          {prod.kondisi} ({prod.berat_kg} kg)
                        </p>
                      </td>

                      {/* Harga Input */}
                      <td className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                        {formatRupiah(prod.harga_input)}
                      </td>

                      {/* Harga Jual */}
                      <td className="px-4 py-3 text-right font-bold text-zinc-950 dark:text-zinc-50">
                        {formatRupiah(prod.harga_jual)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            prod.status === "Tersedia"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                              : prod.status === "Dipesan"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                              : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailProduct(prod)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                            title="Detail Produk"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditProduct(prod)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                            title="Edit Produk"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteProduct(prod)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                            title="Hapus Produk"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onEdit={(prod) => setEditProduct(prod)}
      />

      <ProductCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
        sellers={sellers}
        onSuccess={handleRefresh}
      />

      <ProductEditModal
        product={editProduct}
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        categories={categories}
        sellers={sellers}
        onSuccess={handleRefresh}
      />

      <ProductDeleteModal
        product={deleteProduct}
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
