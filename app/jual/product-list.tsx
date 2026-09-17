"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_PHOTOS_BUCKET, getStoragePathFromPublicUrl } from "@/lib/supabase/storage";
import { formatRupiah } from "@/lib/pricing";
import { Toast } from "@/components/toast";
import type { ProductStatus, ProductWithCategory } from "@/lib/types/database";

const TABS: ProductStatus[] = ["Tersedia", "Dipesan", "Terjual"];

const STATUS_CLASS: Record<ProductStatus, string> = {
  Tersedia:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Dipesan:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Terjual:
    "bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
};

export function ProductList({ products }: { products: ProductWithCategory[] }) {
  const searchParams = useSearchParams();

  const initialToast = useMemo(() => {
    if (searchParams.get("created") === "1") return "Produk berhasil ditambahkan.";
    if (searchParams.get("updated") === "1") return "Produk berhasil diperbarui.";
    if (searchParams.get("error") === "cannot-edit") {
      return "Produk tidak bisa diedit karena statusnya sudah berubah.";
    }
    return null;
  }, [searchParams]);

  const [items, setItems] = useState(products);
  const [activeTab, setActiveTab] = useState<ProductStatus>("Tersedia");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ProductWithCategory | null>(null);
  const [toast, setToast] = useState<string | null>(initialToast);

  const filtered = items.filter((product) => product.status === activeTab);

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
      <div className="mb-6 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => {
          const count = items.filter((p) => p.status === tab).length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Belum ada produk dengan status &quot;{activeTab}&quot;
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {activeTab === "Tersedia"
                ? "Mulai pasang barang yang ingin kamu jual ke sesama mahasiswa."
                : `Belum ada produk kamu yang berada dalam status ${activeTab}.`}
            </p>
          </div>
          {activeTab === "Tersedia" && (
            <Link
              href="/jual/tambah"
              className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              + Tambah Produk
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((product) => {
            const canEdit = product.status === "Tersedia";
            return (
              <div
                key={product.id}
                className="flex gap-3.5 rounded-lg border border-zinc-200 bg-white p-3.5 shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                  {product.foto_urls[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.foto_urls[0]}
                      alt={product.nama_barang}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {product.nama_barang}
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {formatRupiah(product.harga_jual)}
                  </p>
                  <span
                    className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[product.status]}`}
                  >
                    {product.status}
                  </span>

                  <div className="mt-1.5 flex gap-2">
                    {canEdit ? (
                      <Link
                        href={`/jual/edit/${product.id}`}
                        className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Edit
                      </Link>
                    ) : (
                      <span
                        title="Produk yang sudah dipesan/terjual tidak bisa diedit."
                        className="cursor-not-allowed rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                      >
                        Edit
                      </span>
                    )}

                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => setConfirmTarget(product)}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        Hapus
                      </button>
                    ) : (
                      <span
                        title="Produk yang sudah dipesan/terjual tidak bisa dihapus."
                        className="cursor-not-allowed rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                      >
                        Hapus
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 className="mb-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              Hapus produk?
            </h2>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              &quot;{confirmTarget.nama_barang}&quot; beserta foto-fotonya akan dihapus
              permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="h-10 w-full rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmTarget)}
                disabled={deletingId === confirmTarget.id}
                className="h-10 w-full rounded-md bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
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
