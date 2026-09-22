"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_PHOTOS_BUCKET } from "@/lib/supabase/storage";
import { calculateHargaJual, formatRupiah } from "@/lib/pricing";
import type { Category, ProductCondition, ProductStatus, ProductRow, UserRow } from "@/lib/types/database";

export interface AdminProductListItem extends ProductRow {
  kategori: Pick<Category, "id" | "nama_kategori"> | null;
  seller: Pick<UserRow, "id" | "nama_lengkap" | "email" | "no_hp"> | null;
}

const KONDISI_OPTIONS: ProductCondition[] = [
  "Baru",
  "Bekas - Layak Pakai",
  "Bekas - Ada Cacat Minor",
];

const STATUS_OPTIONS: ProductStatus[] = ["Tersedia", "Dipesan", "Terjual"];

function extensionForMime(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

// ----------------------------------------------------------------------
// 1. DETAIL MODAL
// ----------------------------------------------------------------------
export function ProductDetailModal({
  product,
  onClose,
  onEdit,
}: {
  product: AdminProductListItem | null;
  onClose: () => void;
  onEdit: (product: AdminProductListItem) => void;
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!product) return null;

  const breakdown = calculateHargaJual(product.harga_input ?? 0);
  const photos = product.foto_urls && product.foto_urls.length > 0 ? product.foto_urls : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-backdrop">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 my-8 max-h-[90vh] overflow-y-auto animate-modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Detail Katalog Produk
            </span>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 mt-0.5">
              {product.nama_barang}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6">
          {/* Photos Showcase */}
          {photos.length > 0 ? (
            <div>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                {/* eslint-disable-next-html-element-suppress */}
                <img
                  src={photos[activePhotoIndex]}
                  alt={product.nama_barang}
                  className="h-full w-full object-contain"
                />
              </div>
              {photos.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {photos.map((url, idx) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        activePhotoIndex === idx
                          ? "border-zinc-950 dark:border-zinc-100 scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-40 w-full items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-400">
              Tidak ada foto produk
            </div>
          )}

          {/* Badges & Status */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                product.status === "Tersedia"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : product.status === "Dipesan"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                  : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700"
              }`}
            >
              Status: {product.status}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Kategori: {product.kategori?.nama_kategori ?? "Tanpa Kategori"}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Kondisi: {product.kondisi}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Berat: {product.berat_kg} kg
            </span>
          </div>

          {/* Price Breakdown Card */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Rincian Harga & Margin Platform
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Harga Modal Seller</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {formatRupiah(product.harga_input)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Persentase Markup</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {(breakdown.markupRate * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Margin Platform</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +{formatRupiah(breakdown.markupAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Harga Jual Website</p>
                <p className="font-bold text-zinc-950 dark:text-zinc-50 text-base mt-0.5">
                  {formatRupiah(product.harga_jual)}
                </p>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Informasi Penjual (Seller)
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 font-bold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                {product.seller?.nama_lengkap?.charAt(0).toUpperCase() ?? "S"}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {product.seller?.nama_lengkap ?? "Penjual Tidak Ditemukan"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {product.seller?.email} {product.seller?.no_hp ? `• ${product.seller.no_hp}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Deskripsi Barang
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
              {product.deskripsi || "Tidak ada deskripsi."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href={`/produk/${product.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Buka di Marketplace Pembeli ↗
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shadow-xs"
            >
              Edit Produk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. CREATE MODAL
// ----------------------------------------------------------------------
export function ProductCreateModal({
  open,
  onClose,
  categories,
  sellers,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  sellers: UserRow[];
  onSuccess: () => void;
}) {
  const [sellerId, setSellerId] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [kondisi, setKondisi] = useState<ProductCondition>("Bekas - Layak Pakai");
  const [hargaInput, setHargaInput] = useState<number>(0);
  const [hargaInputDisplay, setHargaInputDisplay] = useState("");
  const [beratKg, setBeratKg] = useState("1");
  const [deskripsi, setDeskripsi] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (sellers.length > 0 && !sellerId) {
      setSellerId(sellers[0].id);
    }
    if (categories.length > 0 && !kategoriId) {
      setKategoriId(categories[0].id);
    }
  }, [sellers, categories, sellerId, kategoriId]);

  if (!open) return null;

  const breakdown = calculateHargaJual(hargaInput || 0);

  function handleHargaChange(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    const val = digits ? parseInt(digits, 10) : 0;
    setHargaInput(val);
    setHargaInputDisplay(val ? val.toLocaleString("id-ID") : "");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!sellerId) return setErrorMsg("Pilih seller penanggung jawab.");
    if (!namaBarang.trim()) return setErrorMsg("Nama barang wajib diisi.");
    if (!kategoriId) return setErrorMsg("Pilih kategori barang.");
    if (!hargaInput || hargaInput < 1000) return setErrorMsg("Harga minimal Rp 1.000.");
    const beratVal = parseFloat(beratKg);
    if (isNaN(beratVal) || beratVal <= 0) return setErrorMsg("Berat harus lebih besar dari 0 kg.");
    if (files.length === 0) return setErrorMsg("Unggah minimal 1 foto produk.");

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Upload photos to Supabase Storage
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const path = `${sellerId}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;
        const { error: uploadErr } = await supabase.storage
          .from(PRODUCT_PHOTOS_BUCKET)
          .upload(path, file, { upsert: false });

        if (uploadErr) throw new Error(`Gagal upload foto: ${uploadErr.message}`);

        const { data: publicUrlData } = supabase.storage
          .from(PRODUCT_PHOTOS_BUCKET)
          .getPublicUrl(path);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // 2. Insert into products table
      const { error: insertErr } = await supabase.from("products").insert({
        seller_id: sellerId,
        kategori_id: kategoriId,
        nama_barang: namaBarang.trim(),
        deskripsi: deskripsi.trim() || null,
        kondisi,
        harga_input: breakdown.hargaInput,
        harga_jual: breakdown.hargaJual,
        berat_kg: beratVal,
        foto_urls: uploadedUrls,
        status: "Tersedia",
      });

      if (insertErr) throw insertErr;

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menambahkan produk.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-backdrop">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 my-8 max-h-[90vh] overflow-y-auto animate-modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
            Tambah Produk Katalog Baru
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Seller Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Pilih Penjual (Seller) <span className="text-red-500">*</span>
            </label>
            <select
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
            >
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_lengkap} ({s.email})
                </option>
              ))}
            </select>
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              placeholder="Contoh: Buku Pemrograman Web Second"
              required
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Kategori & Kondisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Kondisi Barang <span className="text-red-500">*</span>
              </label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value as ProductCondition)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              >
                {KONDISI_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Harga Input & Berat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Harga Modal Seller (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={hargaInputDisplay}
                onChange={(e) => handleHargaChange(e.target.value)}
                placeholder="0"
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Berat Produk (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={beratKg}
                onChange={(e) => setBeratKg(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              />
            </div>
          </div>

          {/* Realtime Pricing Preview */}
          {hargaInput > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs flex justify-between items-center">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Markup Platform: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {(breakdown.markupRate * 100).toFixed(0)}% (+{formatRupiah(breakdown.markupAmount)})
                </span>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Harga Jual Website: </span>
                <span className="font-bold text-zinc-950 dark:text-zinc-50">
                  {formatRupiah(breakdown.hargaJual)}
                </span>
              </div>
            </div>
          )}

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Deskripsi Barang
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan spesifikasi, kelengkapan, atau rincian produk..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Foto Produk (Maksimal 5 foto) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-900 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
            />
            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((f, idx) => (
                  <div key={idx} className="relative flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800">
                    <span className="truncate max-w-[120px] text-zinc-700 dark:text-zinc-300">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-red-500 hover:text-red-700 font-bold ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-zinc-950 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shadow-xs"
            >
              {loading ? "Menyimpan..." : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. EDIT MODAL
// ----------------------------------------------------------------------
export function ProductEditModal({
  product,
  open,
  onClose,
  categories,
  sellers,
  onSuccess,
}: {
  product: AdminProductListItem | null;
  open: boolean;
  onClose: () => void;
  categories: Category[];
  sellers: UserRow[];
  onSuccess: () => void;
}) {
  const [sellerId, setSellerId] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [kondisi, setKondisi] = useState<ProductCondition>("Bekas - Layak Pakai");
  const [status, setStatus] = useState<ProductStatus>("Tersedia");
  const [hargaInput, setHargaInput] = useState<number>(0);
  const [hargaInputDisplay, setHargaInputDisplay] = useState("");
  const [beratKg, setBeratKg] = useState("1");
  const [deskripsi, setDeskripsi] = useState("");
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setSellerId(product.seller_id);
      setNamaBarang(product.nama_barang);
      setKategoriId(product.kategori_id);
      setKondisi(product.kondisi);
      setStatus(product.status);
      setHargaInput(product.harga_input);
      setHargaInputDisplay(product.harga_input ? product.harga_input.toLocaleString("id-ID") : "");
      setBeratKg(String(product.berat_kg ?? 1));
      setDeskripsi(product.deskripsi ?? "");
      setExistingPhotos(product.foto_urls ?? []);
      setNewFiles([]);
      setErrorMsg(null);
    }
  }, [product]);

  if (!open || !product) return null;

  const breakdown = calculateHargaJual(hargaInput || 0);

  function handleHargaChange(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    const val = digits ? parseInt(digits, 10) : 0;
    setHargaInput(val);
    setHargaInputDisplay(val ? val.toLocaleString("id-ID") : "");
  }

  function removeExistingPhoto(url: string) {
    setExistingPhotos((prev) => prev.filter((u) => u !== url));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...selected].slice(0, 5 - existingPhotos.length));
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!product) return;
    if (!sellerId) return setErrorMsg("Pilih seller penanggung jawab.");
    if (!namaBarang.trim()) return setErrorMsg("Nama barang wajib diisi.");
    if (!kategoriId) return setErrorMsg("Pilih kategori barang.");
    if (!hargaInput || hargaInput < 1000) return setErrorMsg("Harga minimal Rp 1.000.");
    const beratVal = parseFloat(beratKg);
    if (isNaN(beratVal) || beratVal <= 0) return setErrorMsg("Berat harus lebih besar dari 0 kg.");
    if (existingPhotos.length + newFiles.length === 0) return setErrorMsg("Minimal 1 foto produk harus tetap ada.");

    setLoading(true);
    const supabase = createClient();

    try {
      // Upload new files
      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        const path = `${sellerId}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;
        const { error: uploadErr } = await supabase.storage
          .from(PRODUCT_PHOTOS_BUCKET)
          .upload(path, file, { upsert: false });

        if (uploadErr) throw new Error(`Gagal upload foto: ${uploadErr.message}`);

        const { data: publicUrlData } = supabase.storage
          .from(PRODUCT_PHOTOS_BUCKET)
          .getPublicUrl(path);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const finalPhotos = [...existingPhotos, ...uploadedUrls];

      // Update database
      const { error: updateErr } = await supabase
        .from("products")
        .update({
          seller_id: sellerId,
          kategori_id: kategoriId,
          nama_barang: namaBarang.trim(),
          deskripsi: deskripsi.trim() || null,
          kondisi,
          status,
          harga_input: breakdown.hargaInput,
          harga_jual: breakdown.hargaJual,
          berat_kg: beratVal,
          foto_urls: finalPhotos,
        })
        .eq("id", product.id);

      if (updateErr) throw updateErr;

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal meng-update produk.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-backdrop">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 my-8 max-h-[90vh] overflow-y-auto animate-modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
            Edit Produk Katalog
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Status & Seller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Status Produk <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Penjual (Seller) <span className="text-red-500">*</span>
              </label>
              <select
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              >
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_lengkap} ({s.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Kategori & Kondisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Kondisi Barang <span className="text-red-500">*</span>
              </label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value as ProductCondition)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              >
                {KONDISI_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Harga Input & Berat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Harga Modal Seller (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={hargaInputDisplay}
                onChange={(e) => handleHargaChange(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Berat Produk (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={beratKg}
                onChange={(e) => setBeratKg(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              />
            </div>
          </div>

          {/* Pricing Calculation Preview */}
          {hargaInput > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs flex justify-between items-center">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Markup Platform: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {(breakdown.markupRate * 100).toFixed(0)}% (+{formatRupiah(breakdown.markupAmount)})
                </span>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Harga Jual Website: </span>
                <span className="font-bold text-zinc-950 dark:text-zinc-50">
                  {formatRupiah(breakdown.hargaJual)}
                </span>
              </div>
            </div>
          )}

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Deskripsi Barang
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Foto Management */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Foto Produk Saat Ini & Tambah Foto Baru
            </label>

            {/* Existing Photos Grid */}
            {existingPhotos.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {existingPhotos.map((url) => (
                  <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 group">
                    <img src={url} alt="Foto" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(url)}
                      className="absolute top-0 right-0 bg-red-600 text-white text-xs h-5 w-5 flex items-center justify-center rounded-bl-md opacity-90 hover:opacity-100"
                      title="Hapus Foto Ini"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Files */}
            {existingPhotos.length < 5 && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-900 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
              />
            )}

            {newFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {newFiles.map((f, idx) => (
                  <div key={idx} className="relative flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800">
                    <span className="truncate max-w-[120px] text-zinc-700 dark:text-zinc-300">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="text-red-500 hover:text-red-700 font-bold ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-zinc-950 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shadow-xs"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. DELETE MODAL
// ----------------------------------------------------------------------
export function ProductDeleteModal({
  product,
  open,
  onClose,
  onSuccess,
}: {
  product: AdminProductListItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open || !product) return null;

  async function handleDelete() {
    if (!product) return;
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus produk.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-backdrop">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-modal-pop">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              Hapus Produk Katalog?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
          Apakah Anda yakin ingin menghapus katalog <span className="font-semibold text-zinc-950 dark:text-zinc-100">"{product.nama_barang}"</span>?
        </p>

        {product.status === "Dipesan" && (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-200">
            ⚠️ <strong>Peringatan:</strong> Produk ini saat ini berstatus <strong>Dipesan</strong>. Menghapus produk dapat memengaruhi pesanan pembeli yang sedang berlangsung.
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors shadow-xs"
          >
            {loading ? "Menghapus..." : "Hapus Produk"}
          </button>
        </div>
      </div>
    </div>
  );
}
