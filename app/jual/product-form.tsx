"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_PHOTOS_BUCKET, getStoragePathFromPublicUrl } from "@/lib/supabase/storage";
import { calculateHargaJual, formatRupiah } from "@/lib/pricing";
import type { Category, ProductCondition, ProductWithCategory } from "@/lib/types/database";
import { PhotoPicker } from "./photo-picker";

const MapPickerModal = dynamic(
  () => import("@/components/map-picker-modal").then((mod) => mod.MapPickerModal),
  { ssr: false }
);

const KONDISI_OPTIONS: ProductCondition[] = [
  "Baru",
  "Bekas - Layak Pakai",
  "Bekas - Ada Cacat Minor",
];

interface FormErrors {
  namaBarang?: string;
  kategoriId?: string;
  kondisi?: string;
  hargaInput?: string;
  beratKg?: string;
  photos?: string;
  submit?: string;
}

function extensionForMime(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function ProductForm({
  mode,
  product,
  categories,
  sellerId,
  defaultLat,
  defaultLng,
}: {
  mode: "create" | "edit";
  product?: ProductWithCategory;
  categories: Category[];
  sellerId: string;
  defaultLat: number | null;
  defaultLng: number | null;
}) {
  const router = useRouter();

  const [namaBarang, setNamaBarang] = useState(product?.nama_barang ?? "");
  const [deskripsi, setDeskripsi] = useState(product?.deskripsi ?? "");
  const [kategoriId, setKategoriId] = useState(product?.kategori_id ?? "");
  const [kondisi, setKondisi] = useState<ProductCondition | "">(
    product?.kondisi ?? ""
  );
  const [hargaInput, setHargaInput] = useState<number>(product?.harga_input ?? 0);
  const [hargaInputDisplay, setHargaInputDisplay] = useState(
    product?.harga_input ? product.harga_input.toLocaleString("id-ID") : ""
  );
  const [beratKg, setBeratKg] = useState(
    product?.berat_kg !== undefined ? String(product.berat_kg) : ""
  );

  const [existingUrls, setExistingUrls] = useState<string[]>(product?.foto_urls ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [lat, setLat] = useState<number | null>(product?.lat ?? defaultLat);
  const [lng, setLng] = useState<number | null>(product?.lng ?? defaultLng);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const breakdown = calculateHargaJual(hargaInput || 0);

  function handleHargaChange(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    const value = digits ? parseInt(digits, 10) : 0;
    setHargaInput(value);
    setHargaInputDisplay(value ? value.toLocaleString("id-ID") : "");
  }

  function handleAmbilLokasi() {
    if (!navigator.geolocation) {
      setLocationError("Browser ini tidak mendukung geolocation.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan izin lokasi di browser."
            : "Gagal mengambil lokasi. Coba lagi."
        );
        setLocating(false);
      }
    );
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!namaBarang.trim()) {
      nextErrors.namaBarang = "Nama barang wajib diisi.";
    }
    if (!kategoriId) {
      nextErrors.kategoriId = "Pilih kategori.";
    }
    if (!kondisi) {
      nextErrors.kondisi = "Pilih kondisi barang.";
    }
    if (!hargaInput || hargaInput < 1_000) {
      nextErrors.hargaInput = "Harga minimal Rp 1.000.";
    }
    const beratValue = parseFloat(beratKg);
    if (!beratKg || isNaN(beratValue) || beratValue <= 0) {
      nextErrors.beratKg = "Berat wajib diisi dan lebih besar dari 0.";
    }
    if (existingUrls.length + newFiles.length < 1) {
      nextErrors.photos = "Tambahkan minimal 1 foto produk.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const uploadedUrls: string[] = [];
    for (const file of newFiles) {
      const path = `${sellerId}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;
      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_PHOTOS_BUCKET)
        .upload(path, file);

      if (uploadError) {
        setLoading(false);
        setErrors({ photos: `Gagal mengunggah foto: ${uploadError.message}` });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from(PRODUCT_PHOTOS_BUCKET)
        .getPublicUrl(path);
      uploadedUrls.push(publicUrlData.publicUrl);
    }

    if (mode === "edit" && product) {
      const removedUrls = product.foto_urls.filter(
        (url) => !existingUrls.includes(url)
      );
      const removedPaths = removedUrls
        .map(getStoragePathFromPublicUrl)
        .filter((path): path is string => Boolean(path));
      if (removedPaths.length > 0) {
        await supabase.storage.from(PRODUCT_PHOTOS_BUCKET).remove(removedPaths);
      }
    }

    const fotoUrls = [...existingUrls, ...uploadedUrls];
    const { hargaJual } = calculateHargaJual(hargaInput);
    const beratKgValue = parseFloat(beratKg);

    if (mode === "create") {
      const { error } = await supabase.from("products").insert({
        seller_id: sellerId,
        nama_barang: namaBarang.trim(),
        deskripsi: deskripsi.trim() || null,
        kategori_id: kategoriId,
        kondisi,
        harga_input: hargaInput,
        harga_jual: hargaJual,
        berat_kg: beratKgValue,
        foto_urls: fotoUrls,
        lat,
        lng,
        status: "Tersedia",
      });

      setLoading(false);

      if (error) {
        setErrors({ submit: error.message });
        return;
      }

      router.push("/jual?created=1");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        nama_barang: namaBarang.trim(),
        deskripsi: deskripsi.trim() || null,
        kategori_id: kategoriId,
        kondisi,
        harga_input: hargaInput,
        harga_jual: hargaJual,
        berat_kg: beratKgValue,
        foto_urls: fotoUrls,
        lat,
        lng,
      })
      .eq("id", product!.id)
      .eq("seller_id", sellerId);

    setLoading(false);

    if (error) {
      setErrors({ submit: error.message });
      return;
    }

    router.push("/jual?updated=1");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nama_barang" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Nama barang
        </label>
        <input
          id="nama_barang"
          type="text"
          value={namaBarang}
          onChange={(e) => setNamaBarang(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
        {errors.namaBarang && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.namaBarang}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="deskripsi" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Deskripsi <span className="font-normal text-zinc-500 dark:text-zinc-400">(opsional, disarankan diisi)</span>
        </label>
        <textarea
          id="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="kategori_id" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Kategori
        </label>
        <select
          id="kategori_id"
          value={kategoriId}
          onChange={(e) => setKategoriId(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        >
          <option value="" disabled>
            Pilih kategori
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nama_kategori}
            </option>
          ))}
        </select>
        {errors.kategoriId && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.kategoriId}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="kondisi" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Kondisi
        </label>
        <select
          id="kondisi"
          value={kondisi}
          onChange={(e) => setKondisi(e.target.value as ProductCondition)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        >
          <option value="" disabled>
            Pilih kondisi
          </option>
          {KONDISI_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.kondisi && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.kondisi}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="harga_input" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Harga kamu (Rp)
        </label>
        <input
          id="harga_input"
          type="text"
          inputMode="numeric"
          value={hargaInputDisplay}
          onChange={(e) => handleHargaChange(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
        {errors.hargaInput && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.hargaInput}</p>
        )}

        {hargaInput > 0 && (
          <div className="rounded-md border border-blue-100 bg-blue-50/50 p-3 text-xs text-zinc-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-zinc-300">
            <p>
              Harga kamu: {formatRupiah(breakdown.hargaInput)} + Markup platform (
              {Math.round(breakdown.markupRate * 100)}%): {formatRupiah(breakdown.markupAmount)}
            </p>
            <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
              = Harga jual ke pembeli: {formatRupiah(breakdown.hargaJual)}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="berat_kg" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Berat (kg)
        </label>
        <input
          id="berat_kg"
          type="number"
          step={0.1}
          min={0.1}
          value={beratKg}
          onChange={(e) => setBeratKg(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
        {errors.beratKg && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.beratKg}</p>
        )}
      </div>

      <PhotoPicker
        existingUrls={existingUrls}
        onRemoveExisting={(url) => setExistingUrls((prev) => prev.filter((u) => u !== url))}
        newFiles={newFiles}
        onAddFiles={(files) => setNewFiles((prev) => [...prev, ...files])}
        onRemoveNewFile={(index) => setNewFiles((prev) => prev.filter((_, i) => i !== index))}
        error={errors.photos}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Lokasi Penjual</span>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            suppressHydrationWarning
            type="button"
            onClick={handleAmbilLokasi}
            disabled={locating}
            className="h-10 flex-1 rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {locating ? "Mengambil lokasi..." : "Ambil Lokasi Saya"}
          </button>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setMapModalOpen(true)}
            className="h-10 flex items-center justify-center gap-2 px-4 rounded-md border border-blue-600 bg-blue-50 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors shrink-0 cursor-pointer"
          >
            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Pilih dari Maps</span>
          </button>
        </div>
        {lat !== null && lng !== null && (
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
            Koordinat: {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        )}
        {locationError && (
          <p className="text-xs text-red-600 dark:text-red-400">{locationError}</p>
        )}
      </div>

      {errors.submit && (
        <p className="text-xs text-red-600 dark:text-red-400">{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 h-11 w-full rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {loading
          ? "Menyimpan..."
          : mode === "create"
            ? "Simpan Produk"
            : "Simpan Perubahan"}
      </button>
    </form>

    <MapPickerModal
      isOpen={mapModalOpen}
      onClose={() => setMapModalOpen(false)}
      initialLat={lat}
      initialLng={lng}
      onSelectLocation={(newLat, newLng) => {
        setLat(newLat);
        setLng(newLng);
        setLocationError(null);
      }}
    />
  </>
  );
}
