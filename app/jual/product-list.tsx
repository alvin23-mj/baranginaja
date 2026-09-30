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
  Tersedia: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Dipesan: "bg-amber-50 text-amber-700 border border-amber-200",
  Terjual: "bg-zinc-100 text-zinc-700 border border-zinc-200",
};

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
      return "Produk tidak bisa diedit karena statusnya sudah berubah.";
    }
    return null;
  }, [searchParams]);

  const [items, setItems] = useState<ProductWithCategory[]>(products);
  const [activeTab, setActiveTab] = useState<ProductStatus>(() => {
    const hasTersedia = products.some((p) => p.status === "Tersedia");
    if (!hasTersedia) {
      if (products.some((p) => p.status === "Dipesan")) return "Dipesan";
      if (products.some((p) => p.status === "Terjual")) return "Terjual";
    }
    return "Tersedia";
  });
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
      {/* Tab Navigasi Bersih & Simpel */}
      <div className="mb-6 flex gap-6 border-b border-zinc-200">
        {TABS.map((tab) => {
          const count = items.filter((p) => p.status === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "border-zinc-950 text-zinc-950 font-semibold"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-base text-zinc-500 font-normal">
            {activeTab === "Tersedia"
              ? "Belum ada barang yang tersedia saat ini."
              : activeTab === "Dipesan"
              ? "Belum ada barang yang sedang dipesan saat ini."
              : "Belum ada barang yang terjual saat ini."}
          </p>
        </div>
      ) : (
        /* Grid Kartu Produk Persis Seperti di Katalog */
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {filtered.map((product) => {
            const canEdit = product.status === "Tersedia";

            if (!canEdit) {
              return (
                <Link
                  key={product.id}
                  href={`/produk/${product.id}`}
                  className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                    {product.foto_urls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.foto_urls[0]}
                        alt={product.nama_barang}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        Tanpa foto
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 p-3.5">
                    <p className="truncate text-sm font-medium text-zinc-950">
                      {product.nama_barang}
                    </p>
                    <p className="text-base font-bold text-zinc-950">
                      {formatRupiah(product.harga_jual)}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                      </svg>
                      <span className="truncate">
                        {districtName ? `Kec. ${districtName}` : "Surabaya"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={product.id}
                className="flex flex-col justify-between overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <Link href={`/produk/${product.id}`} className="flex flex-col">
                  <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                    {product.foto_urls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.foto_urls[0]}
                        alt={product.nama_barang}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        Tanpa foto
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 p-3.5 pb-0">
                    <p className="truncate text-sm font-medium text-zinc-950">
                      {product.nama_barang}
                    </p>
                    <p className="text-base font-bold text-zinc-950">
                      {formatRupiah(product.harga_jual)}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                      </svg>
                      <span className="truncate">
                        {districtName ? `Kec. ${districtName}` : "Surabaya"}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="p-3.5 pt-2.5">
                  <div className="flex items-center gap-2 pt-2.5 border-t border-zinc-100">
                    <Link
                      href={`/jual/edit/${product.id}`}
                      className="flex-1 text-center rounded-md border border-zinc-300 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmTarget(product)}
                      className="flex-1 rounded-md border border-red-200 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

