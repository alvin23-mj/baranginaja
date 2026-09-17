"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Sembunyikan footer di halaman admin, login, atau register (selaras dengan navbar)
  if (
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null;
  }

  return (
    <footer className="w-full bg-[#111111] text-zinc-300 mt-auto">
      {/* Konten Utama Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-12 lg:pb-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Kolom 1: Branding & Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center group transition-opacity hover:opacity-90"
              aria-label="baranginaja"
            >
              <span className="text-2xl font-bold tracking-tight text-white select-none">
                barangin<span className="text-amber-700">aja</span>
              </span>
            </Link>

            <p className="text-[13px] text-zinc-400 leading-relaxed max-w-sm">
              Platform marketplace jual beli barang bekas terpercaya antar warga dan mahasiswa di 31 kecamatan Kota Surabaya. Transaksi aman, hemat, dan langsung tanpa potongan komisi sepeser pun.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram BaranginAja"
                className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok BaranginAja"
                className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>

              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp BaranginAja"
                className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) BaranginAja"
                className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Kolom 2: Jelajahi */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-white">
              Jelajahi
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link
                  href="/"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/produk"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Katalog Produk
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang-kami"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/jual"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Mulai Jual Barang
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kategori Populer */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-white">
              Kategori Populer
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link
                  href="/produk"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Elektronik & Gadget
                </Link>
              </li>
              <li>
                <Link
                  href="/produk"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Perabot & Kos
                </Link>
              </li>
              <li>
                <Link
                  href="/produk"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Buku & Kuliah
                </Link>
              </li>
              <li>
                <Link
                  href="/produk"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Hobi & Olahraga
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Bantuan & Informasi */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-white">
              Bantuan & Panduan
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link
                  href="/#hubungi-kami"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/bantuan"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Pusat Bantuan & FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/bantuan"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Panduan Transaksi Aman
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang-kami"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang-kami"
                  className="text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bagian Bawah Footer (Copyright) - Tanpa garis border/outline */}
        <div className="pt-12 sm:pt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="text-zinc-400 font-medium">baranginaja</span>. Dibuat untuk warga & mahasiswa Surabaya.
          </p>
          <p className="text-zinc-500">Surabaya, Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
