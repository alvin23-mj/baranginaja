import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccessDeniedToast } from "@/components/access-denied-toast";
import { HeroStatsTicker } from "@/components/hero-stats-ticker";
import { CategoryShowcase } from "@/components/category-showcase";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { ContactSection } from "@/components/contact-section";
import { ProductCard } from "@/components/product-card";
import type { ProductWithSeller } from "@/lib/types/database";

const PRODUCT_SELECT =
  "*, kategori:categories(id, nama_kategori), seller:users!inner(id, nama_lengkap, status_verifikasi, kecamatan_id, kecamatan:districts(id, nama_kecamatan))";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const aksesDitolak = params.akses_ditolak === "1";

  const supabase = await createClient();
  let dbProducts: ProductWithSeller[] = [];
  let categories: { id: string; nama_kategori: string }[] = [];

  try {
    const [{ data: prodData }, { data: catData }] = await Promise.all([
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "Tersedia")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("categories")
        .select("id, nama_kategori")
        .order("nama_kategori", { ascending: true }),
    ]);

    if (prodData && prodData.length > 0) {
      dbProducts = prodData as ProductWithSeller[];
    }
    if (catData && catData.length > 0) {
      categories = catData;
    }
  } catch {
    // Abaikan kegagalan koneksi jika belum ada produk
  }

  const displayProducts = dbProducts;

  return (
    <main className="flex-1 bg-[#f0f0f0] text-zinc-900">
      {aksesDitolak && <AccessDeniedToast />}

      {/* ========================================================================= */}
      {/* 1. HERO IMAGE (CONTAINER FLUID - EDGE TO EDGE FULL)                       */}
      {/* ========================================================================= */}
      <section className="w-full overflow-hidden bg-zinc-950">
        <Image
          src="/images/hero-campus.jpg"
          alt="BaranginAja Pasar Barang Bekas Mahasiswa"
          width={1920}
          height={800}
          priority
          className="w-full h-auto object-cover max-h-[480px] sm:max-h-[560px] lg:max-h-[640px]"
        />
      </section>

      {/* ========================================================================= */}
      {/* 2. KEUNGGULAN / STATS TICKER (SLIDER AUTO BERJALAN)                        */}
      {/* ========================================================================= */}
      <HeroStatsTicker />

      {/* ========================================================================= */}
      {/* 3. SECTION: KATEGORI PILIHAN (4 CARDS EDITORIAL LAYOUT)                   */}
      {/* ========================================================================= */}
      <CategoryShowcase categories={categories} />

      {/* ========================================================================= */}
      {/* 4. SECTION: PRODUK TERBARU DI SURABAYA (8 CARDS)                          */}
      {/* ========================================================================= */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 lg:pb-24">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-zinc-950 dark:text-zinc-50">
            Produk Terbaru di Surabaya
          </h2>

          <Link
            href="/produk"
            className="text-[14px] font-normal text-zinc-950 hover:text-amber-600 dark:text-white dark:hover:text-amber-400 transition-colors shrink-0"
          >
            Lihat Semua Produk
          </Link>
        </div>

        {/* Product Cards Grid / Empty State */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 px-4">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Belum ada produk yang dijual saat ini
            </p>
            <p className="text-sm text-zinc-500 max-w-sm">
              Semua produk dummy telah dibersihkan. Jadilah yang pertama menjual barang bekas berkualitasmu di Surabaya!
            </p>
            <Link
              href="/jual"
              className="mt-2 inline-flex items-center rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
            >
              Mulai Jual Barang
            </Link>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION: ALUR TRANSAKSI & JUAL BELI (BG SEPERTI NAVBAR #111111)        */}
      {/* ========================================================================= */}
      <HowItWorksSection />

      {/* ========================================================================= */}
      {/* 6. SECTION: HUBUNGI KAMI (FORM & SALURAN BANTUAN)                         */}
      {/* ========================================================================= */}
      <ContactSection />
    </main>
  );
}
