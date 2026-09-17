import Link from "next/link";
import { formatRupiah } from "@/lib/pricing";
import { findDistrictName } from "@/lib/districts";
import type { ProductWithSeller } from "@/lib/types/database";

export function ProductCard({ product }: { product: ProductWithSeller }) {
  const districtName =
    product.seller?.kecamatan?.nama_kecamatan ||
    findDistrictName(product.seller?.kecamatan_id) ||
    findDistrictName(product.seller?.kampus_id) ||
    product.seller?.kampus?.nama_kampus;

  return (
    <Link
      href={`/produk/${product.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-200 dark:bg-zinc-900"
    >
      <div className="aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {product.foto_urls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.foto_urls[0]}
            alt={product.nama_barang}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400 dark:text-zinc-500">
            Tanpa foto
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-3.5">
        <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
          {product.nama_barang}
        </p>
        <p className="text-base font-bold text-zinc-950 dark:text-zinc-50">
          {formatRupiah(product.harga_jual)}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
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
          <span className="truncate">{districtName ? `Kec. ${districtName}` : "Surabaya"}</span>
        </div>
      </div>
    </Link>
  );
}
