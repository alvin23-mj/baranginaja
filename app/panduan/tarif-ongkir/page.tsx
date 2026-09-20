import Link from "next/link";
import { OngkirCalculator } from "./ongkir-calculator";

export const metadata = {
  title: "Ketentuan Tarif & Ongkir - BaranginAja",
  description:
    "Rincian tarif jarak dan berat serta rumus perhitungan ongkos kirim transparan di BaranginAja Surabaya.",
};

export default function TarifOngkirPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/bantuan" className="hover:text-zinc-900 transition-colors">
              Panduan
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Tarif & Ongkir</span>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-800 shadow-2xs">
              Transparan & Terjangkau
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Ketentuan Tarif & Ongkos Kirim
            </h1>
            <p className="text-zinc-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              Biaya pengiriman dihitung secara adil berdasarkan jarak tempuh rute dan berat barang pesanan antar kecamatan di Kota Surabaya.
            </p>
          </div>
        </div>

        {/* 2 Komponen Tarif Dasar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Tarif Jarak Rute
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-zinc-950">Rp 2.500</span>
              <span className="text-sm font-semibold text-zinc-500">/ kilometer</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 pt-1 leading-relaxed">
              Dihitung otomatis dari estimasi rute titik penjemputan penjual menuju alamat penerima di wilayah Surabaya.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Tarif Berat Barang
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-zinc-950">Rp 5.000</span>
              <span className="text-sm font-semibold text-zinc-500">/ kilogram</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 pt-1 leading-relaxed">
              Dihitung berdasarkan berat paket barang pesanan per kilogram untuk menjaga kelayakan penanganan kurir.
            </p>
          </div>
        </div>

        {/* Opsi COD Gratis */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Opsi Hemat COD: Rp 0 (Bebas Ongkir)
          </span>
          <h3 className="text-lg font-bold text-zinc-950">
            Gratis Ongkir Jika Bertemu Langsung di Titik Temu
          </h3>
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
            Jika Anda dan penjual memilih metode COD (Cash on Delivery) di area Surabaya seperti perpustakaan kampus, lobi fakultas, kantin, minimarket 24 jam, atau taman kota Surabaya, tidak dikenakan biaya pengiriman sepeser pun.
          </p>
        </div>

        {/* Kalkulator Simulasi Interaktif */}
        <OngkirCalculator />

        {/* Rumus & Aturan Pembulatan */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-zinc-950">
            Rumus & Ketentuan Pembulatan
          </h2>
          <div className="p-4 rounded-xl bg-zinc-950 text-white font-mono text-sm sm:text-base">
            Ongkir = (Jarak × Rp 2.500) + (Berat × Rp 5.000)
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            *Semua hasil penjumlahan tarif kurir dibulatkan ke atas (round up) ke kelipatan <strong>Rp 5.000</strong> terdekat demi kemudahan pembayaran dan penyesuaian operasional kurir lokal Surabaya.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="text-center pt-2 pb-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/panduan/keamanan-cod"
            className="px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Pelajari Keamanan & Titik Temu COD
          </Link>
          <Link
            href="/faq"
            className="px-6 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-800 text-sm font-semibold hover:bg-zinc-100 transition-colors"
          >
            Pertanyaan Umum (FAQ)
          </Link>
        </div>
      </div>
    </div>
  );
}
