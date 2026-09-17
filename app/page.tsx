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

        {/* Product Cards Grid / Simple Empty State */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-14 text-center">
            <p className="text-base text-zinc-500 font-normal">
              Belum ada barang yang tersedia saat ini.
            </p>
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
