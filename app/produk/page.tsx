import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import { getDistricts } from "@/lib/districts";
import type { Category, ProductWithSeller } from "@/lib/types/database";
import { ProductFilters } from "./product-filters";

const PAGE_SIZE = 12;

const SORT_OPTIONS = {
  terbaru: { column: "created_at", ascending: false },
  harga_asc: { column: "harga_jual", ascending: true },
  harga_desc: { column: "harga_jual", ascending: false },
} as const;

type SortKey = keyof typeof SORT_OPTIONS;

function paramStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const PRODUCT_SELECT =
  "*, kategori:categories(id, nama_kategori), seller:users!inner(id, nama_lengkap, status_verifikasi, kecamatan_id, kecamatan:districts(id, nama_kecamatan))";

export default async function ProdukPage({ searchParams }: PageProps<"/produk">) {
  const params = await searchParams;

  const kategoriId = paramStr(params.kategori);
  const districtId = paramStr(params.kecamatan) || paramStr(params.kampus);
  const kondisi = paramStr(params.kondisi);
  const search = paramStr(params.q);
  const sortParam = paramStr(params.sort);
  const sort: SortKey = sortParam in SORT_OPTIONS ? (sortParam as SortKey) : "terbaru";
  const page = Math.max(1, parseInt(paramStr(params.page), 10) || 1);

  const supabase = await createClient();

  const [{ data: categories }, districts] = await Promise.all([
    supabase.from("categories").select("id, nama_kategori").order("nama_kategori", { ascending: true }),
    getDistricts(supabase),
  ]);

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("status", "Tersedia");

  if (kategoriId) query = query.eq("kategori_id", kategoriId);
  if (kondisi) query = query.eq("kondisi", kondisi);
  if (districtId) query = query.eq("seller.kecamatan_id", districtId);
  if (search) query = query.ilike("nama_barang", `%${search}%`);

  const sortConfig = SORT_OPTIONS[sort];
  query = query.order(sortConfig.column, { ascending: sortConfig.ascending });

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: products, count } = await query.range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const baseParams = new URLSearchParams();
  if (kategoriId) baseParams.set("kategori", kategoriId);
  if (districtId) baseParams.set("kecamatan", districtId);
  if (kondisi) baseParams.set("kondisi", kondisi);
  if (search) baseParams.set("q", search);
  if (sort !== "terbaru") baseParams.set("sort", sort);

  function pageHref(targetPage: number): string {
    const next = new URLSearchParams(baseParams);
    if (targetPage > 1) next.set("page", String(targetPage));
    const qs = next.toString();
    return qs ? `/produk?${qs}` : "/produk";
  }

  const items = (products as ProductWithSeller[]) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Cari Produk
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Barang bekas layak pakai dari warga & mahasiswa se-Surabaya.
        </p>
      </div>

      <ProductFilters
        categories={(categories as Category[]) ?? []}
        districts={districts}
      />

      {items.length === 0 ? (
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
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Belum ada produk ditemukan
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Coba ubah kata kunci pencarian atau filter yang kamu gunakan.
            </p>
          </div>
          <Link
            href="/produk"
            className="mt-2 rounded-md border border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset Filter
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Sebelumnya
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
                  Sebelumnya
                </span>
              )}

              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Halaman {page} dari {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Berikutnya
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
                  Berikutnya
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
