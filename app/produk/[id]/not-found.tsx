import Link from "next/link";

export default function ProdukNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-2 px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Produk tidak ditemukan
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Produk yang kamu cari mungkin sudah dihapus atau tidak pernah ada.
      </p>
      <Link
        href="/produk"
        className="mt-4 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
      >
        Kembali ke Cari Produk
      </Link>
    </div>
  );
}
