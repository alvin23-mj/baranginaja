import Link from "next/link";
import Image from "next/image";
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
    <main className="flex-1">
      {/* Hero Banner Katalog Full-Width seperti di Beranda (Tinggi Lebih Ringkas) */}
      <section className="w-full overflow-hidden bg-zinc-950">
        <Image
          src="/images/catalog-hero.jpg"
          alt="Katalog Barang Bekas Mahasiswa & Warga Surabaya"
          width={1920}
          height={800}
          priority
          className="w-full h-auto object-cover max-h-[220px] sm:max-h-[280px] lg:max-h-[340px]"
        />
      </section>

      {/* Filter diposisikan di tengah di bawah banner */}
      <div className="relative z-10 -mt-6 sm:-mt-8 px-4">
        <div className="mx-auto w-full max-w-4xl">
          <ProductFilters
            categories={(categories as Category[]) ?? []}
            districts={districts}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-12 sm:pb-16">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-normal text-zinc-500 dark:text-zinc-400">
              Belum ada produk yang sesuai dengan filter atau pencarian Anda.
            </p>
            <Link
              href="/produk"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-950 hover:underline transition-colors dark:text-white"
            >
              Tampilkan semua produk &rarr;
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
    </main>
  );
}
