"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_PHOTOS_BUCKET, getStoragePathFromPublicUrl } from "@/lib/supabase/storage";
import { formatRupiah } from "@/lib/pricing";
import { Toast } from "@/components/toast";
import { Check, Clock, CheckCircle2, Eye, Lock, Pencil, Trash2 } from "lucide-react";
import type { ProductStatus, ProductWithCategory } from "@/lib/types/database";

const TABS = ["Semua", "Tersedia", "Dipesan", "Terjual"] as const;
type TabType = (typeof TABS)[number];

export function ProductList({
  products,
  districtName,
}: {
  products: ProductWithCategory[];
  districtName?: string | null;
}) {
  const searchParams = useSearchParams();

  const initialToast = useMemo(() => {
    if (searchParams.get("created") === "1") return "Produk berhasil ditambahkan.";
    if (searchParams.get("updated") === "1") return "Produk berhasil diperbarui.";
    if (searchParams.get("error") === "cannot-edit") {
      return "Produk tidak bisa diedit karena sudah dipesan atau terjual.";
    }
    return null;
  }, [searchParams]);

  const [items, setItems] = useState<ProductWithCategory[]>(products);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const hasTersedia = products.some((p) => p.status === "Tersedia");
    if (!hasTersedia) {
      if (products.some((p) => p.status === "Terjual")) return "Terjual";
      if (products.some((p) => p.status === "Dipesan")) return "Dipesan";
    }
    return "Semua";
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ProductWithCategory | null>(null);
  const [toast, setToast] = useState<string | null>(initialToast);

  // Keep items synced if server props update
  useEffect(() => {
    setItems(products);
  }, [products]);

  const filtered = activeTab === "Semua" ? items : items.filter((product) => product.status === activeTab);

  async function handleDelete(product: ProductWithCategory) {
    setDeletingId(product.id);
    const supabase = createClient();

    const paths = product.foto_urls
      .map(getStoragePathFromPublicUrl)
      .filter((path): path is string => Boolean(path));
    if (paths.length > 0) {
      await supabase.storage.from(PRODUCT_PHOTOS_BUCKET).remove(paths);
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
      .eq("status", "Tersedia");

    setDeletingId(null);
    setConfirmTarget(null);

    if (error) {
      setToast(`Gagal menghapus produk: ${error.message}`);
      return;
    }

    setItems((prev) => prev.filter((p) => p.id !== product.id));
    setToast("Produk berhasil dihapus.");
  }

  return (
    <div>
      {/* Tab Navigasi Bersih & Simpel */}
      <div className="mb-6 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => {
          const count = tab === "Semua" ? items.length : items.filter((p) => p.status === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 pb-3 text-sm font-normal transition-colors cursor-pointer ${
                isActive
                  ? "border-zinc-950 text-zinc-950 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-14 text-center rounded-xl border border-dashed border-zinc-200 bg-white/60 p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-sm text-zinc-500 font-normal dark:text-zinc-400">
            {activeTab === "Semua"
              ? "Belum ada produk yang kamu daftarkan."
              : activeTab === "Tersedia"
                ? "Belum ada barang yang tersedia saat ini."
                : activeTab === "Dipesan"
                  ? "Belum ada barang yang sedang dipesan saat ini."
                  : "Belum ada barang yang terjual saat ini."}
          </p>
          {activeTab === "Tersedia" && (
            <Link
              href="/jual/tambah"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-normal text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              + Tambah Produk Sekarang
            </Link>
          )}
        </div>
      ) : (
        /* Tabel Produk */
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/75 text-sm font-normal text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3.5 font-normal">Produk</th>
                <th className="px-4 py-3.5 font-normal">Kategori</th>
                <th className="px-4 py-3.5 font-normal">Harga Jual</th>
                <th className="px-4 py-3.5 font-normal">Status</th>
                <th className="px-4 py-3.5 font-normal">Lokasi</th>
                <th className="px-5 py-3.5 text-center font-normal">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filtered.map((product) => {
                const canEdit = product.status === "Tersedia";
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50/80 transition-colors dark:hover:bg-zinc-800/40"
                  >
                    {/* Produk: Foto + Nama */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <Link
                          href={`/produk/${product.id}`}
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 block group"
                        >
                          {product.foto_urls[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.foto_urls[0]}
                              alt={product.nama_barang}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                              No foto
                            </div>
                          )}
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/produk/${product.id}`}
                            className="font-normal text-zinc-950 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400 truncate block transition-colors max-w-xs text-sm"
                            title={product.nama_barang}
                          >
                            {product.nama_barang}
                          </Link>
                          <span className="text-sm text-zinc-400 dark:text-zinc-500">
                            ID: {product.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-normal whitespace-nowrap">
                      {product.kategori?.nama_kategori || "-"}
                    </td>

                    {/* Harga Jual */}
                    <td className="px-4 py-3.5 font-normal text-zinc-950 dark:text-zinc-50 text-sm whitespace-nowrap">
                      {formatRupiah(product.harga_jual)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-normal ${
                          product.status === "Terjual"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : product.status === "Dipesan"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                        }`}
                      >
                        {product.status === "Terjual" ? (
                          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                        ) : product.status === "Dipesan" ? (
                          <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                        )}
                        {product.status}
                      </span>
                    </td>

                    {/* Lokasi */}
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-normal whitespace-nowrap">
                      {districtName ? `Kec. ${districtName}` : "Surabaya"}
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap text-sm font-normal">
                      {canEdit ? (
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/jual/edit/${product.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-sm font-normal text-white hover:bg-blue-700 transition-colors shadow-2xs"
                          >
                            <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmTarget(product)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-sm font-normal text-white hover:bg-red-700 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/produk/${product.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-sm font-normal text-white hover:bg-blue-700 transition-colors shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            Lihat Detail
                          </Link>
                          <span className="inline-flex items-center gap-1.5 text-sm font-normal text-zinc-500 dark:text-zinc-400 py-1 px-2.5 rounded-md bg-zinc-100 dark:bg-zinc-800 select-none">
                            <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            Terkunci
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-semibold text-zinc-950">
              Hapus produk?
            </h2>
            <p className="mb-4 text-sm text-zinc-600">
              &quot;{confirmTarget.nama_barang}&quot; beserta fotonya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="h-10 w-full rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmTarget)}
                disabled={deletingId === confirmTarget.id}
                className="h-10 w-full rounded-lg bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              >
                {deletingId === confirmTarget.id ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
