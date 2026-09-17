import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateOngkir, formatRupiah } from "@/lib/pricing";
import { haversineDistanceKm } from "@/lib/geo";
import { findDistrictName } from "@/lib/districts";
import { SAMPLE_PRODUCTS } from "@/lib/sample-products";
import type { ProductWithSeller } from "@/lib/types/database";
import { ProductGallery } from "./product-gallery";

const PRODUCT_SELECT =
  "*, kategori:categories(id, nama_kategori), seller:users(id, nama_lengkap, status_verifikasi, kecamatan_id, kecamatan:districts(id, nama_kecamatan))";

function formatSellerName(namaLengkap: string): string {
  const parts = namaLengkap.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "Penjual";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

const CHECKOUT_ERROR_MESSAGE: Record<string, string> = {
  unavailable: "Produk ini sudah tidak tersedia untuk dipesan.",
  own_product: "Kamu tidak bisa memesan produkmu sendiri.",
};

export default async function ProdukDetailPage({
  params,
  searchParams,
}: PageProps<"/produk/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const checkoutErrorParam = sp.checkout_error;
  const checkoutError =
    typeof checkoutErrorParam === "string"
      ? CHECKOUT_ERROR_MESSAGE[checkoutErrorParam]
      : undefined;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .single();

  let item = product as ProductWithSeller | null;
  if (!item) {
    const sample = SAMPLE_PRODUCTS.find((p) => p.id === id);
    if (sample) {
      item = sample;
    } else {
      notFound();
    }
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let buyerProfile: { lat: number | null; lng: number | null } | null = null;
  if (authUser) {
    const { data } = await supabase
      .from("users")
      .select("lat, lng")
      .eq("id", authUser.id)
      .single();
    buyerProfile = data;
  }

  const isOwnProduct = authUser?.id === item.seller_id;
  const isAvailable = item.status === "Tersedia";

  let ongkirNode: React.ReactNode;
  if (!authUser || buyerProfile?.lat == null || buyerProfile?.lng == null) {
    ongkirNode = (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href={authUser ? "/profil" : `/login?redirectTo=/produk/${item.id}`}
          className="font-medium text-zinc-950 underline dark:text-zinc-50"
        >
          {authUser ? "Lengkapi profil" : "Login & lengkapi profil"}
        </Link>{" "}
        untuk lihat estimasi ongkir.
      </p>
    );
  } else if (item.lat == null || item.lng == null) {
    ongkirNode = (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Lokasi produk belum tersedia, estimasi ongkir tidak dapat dihitung.
      </p>
    );
  } else {
    const jarakKm = haversineDistanceKm(
      buyerProfile.lat,
      buyerProfile.lng,
      item.lat,
      item.lng
    );
    const { ongkirFinal } = calculateOngkir(jarakKm, item.berat_kg);
    ongkirNode = (
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        Estimasi ongkir kurir:{" "}
        <span className="font-medium text-zinc-950 dark:text-zinc-50">
          {formatRupiah(ongkirFinal)}
        </span>{" "}
        (jarak ~{jarakKm.toFixed(1)} km)
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      {checkoutError && (
        <div className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          {checkoutError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <ProductGallery photos={item.foto_urls} alt={item.nama_barang} />

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              {item.nama_barang}
            </h1>
            <p className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              {formatRupiah(item.harga_jual)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {item.kondisi}
            </span>
            {item.kategori && (
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {item.kategori.nama_kategori}
              </span>
            )}
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {item.berat_kg} kg
            </span>
          </div>

          {item.deskripsi && (
            <p className="whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">
              {item.deskripsi}
            </p>
          )}

          <div className="rounded-lg border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {item.seller ? formatSellerName(item.seller.nama_lengkap) : "Penjual"}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500"
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
                <span>
                  {(() => {
                    const dName =
                      item.seller?.kecamatan?.nama_kecamatan ||
                      findDistrictName(item.seller?.kecamatan_id) ||
                      findDistrictName(item.seller?.kampus_id) ||
                      item.seller?.kampus?.nama_kampus;
                    return dName ? `Kec. ${dName}, Surabaya` : "Surabaya";
                  })()}
                </span>
              </span>
              {item.seller?.status_verifikasi === "verified" && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Terverifikasi
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900">{ongkirNode}</div>

          {!isAvailable && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
              Produk ini sudah tidak tersedia.
            </div>
          )}

          {isOwnProduct ? (
            <button
              type="button"
              disabled
              title="Ini produk kamu sendiri"
              className="h-11 w-full cursor-not-allowed rounded-md bg-zinc-200 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
            >
              Ini produk kamu sendiri
            </button>
          ) : !isAvailable ? (
            <button
              type="button"
              disabled
              className="h-11 w-full cursor-not-allowed rounded-md bg-zinc-200 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
            >
              Pesan Sekarang
            </button>
          ) : !authUser ? (
            <Link
              href={`/login?redirectTo=/produk/${item.id}`}
              className="flex h-11 w-full items-center justify-center rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Pesan Sekarang
            </Link>
          ) : (
            <Link
              href={`/checkout/${item.id}`}
              className="flex h-11 w-full items-center justify-center rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Pesan Sekarang
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
