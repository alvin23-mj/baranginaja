import Link from "next/link";
import { OngkirCalculator } from "./ongkir-calculator";

export const metadata = {
  title: "Ketentuan Tarif & Ongkir - BaranginAja",
  description:
    "Rincian tarif jarak dan berat serta rumus perhitungan ongkos kirim transparan di BaranginAja Surabaya.",
};

export default function TarifOngkirPage() {
  return (
    <main className="flex-1 bg-[#f0f0f0] text-zinc-900">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 space-y-20 sm:space-y-28 lg:space-y-32">
        {/* Header Editorial Title */}
        <section className="text-center max-w-4xl lg:max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
            style={{
              fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
              fontWeight: 300,
            }}
          >
            Ketentuan Tarif & Ongkos Kirim
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            Biaya pengiriman dihitung secara adil berdasarkan jarak tempuh rute dan berat barang pesanan antar kecamatan di Kota Surabaya.
          </p>
        </section>

        {/* 2 Komponen Tarif Dasar & Opsi COD Gratis */}
        <section className="space-y-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
            <div className="bg-white p-7 sm:p-9 rounded-2xl sm:rounded-3xl shadow-md space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tarif Jarak Rute
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-normal text-zinc-950">Rp 2.500</span>
                <span className="text-sm font-normal text-zinc-500">/ kilometer</span>
              </div>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed pt-1">
                Dihitung otomatis dari estimasi rute titik penjemputan penjual menuju alamat penerima di wilayah Surabaya.
              </p>
            </div>

            <div className="bg-white p-7 sm:p-9 rounded-2xl sm:rounded-3xl shadow-md space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tarif Berat Barang
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-normal text-zinc-950">Rp 5.000</span>
                <span className="text-sm font-normal text-zinc-500">/ kilogram</span>
              </div>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed pt-1">
                Dihitung berdasarkan berat paket barang pesanan per kilogram untuk menjaga kelayakan penanganan kurir.
              </p>
            </div>
          </div>

          {/* Opsi COD Gratis */}
          <div className="bg-white p-7 sm:p-9 rounded-2xl sm:rounded-3xl shadow-md space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Opsi Hemat COD: Rp 0 (Bebas Ongkir)
            </span>
            <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
              Gratis Ongkir Jika Bertemu Langsung di Titik Temu
            </h3>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Jika Anda dan penjual memilih metode COD (Cash on Delivery) di area Surabaya seperti perpustakaan kampus, lobi fakultas, kantin, minimarket 24 jam, atau taman kota Surabaya, tidak dikenakan biaya pengiriman sepeser pun.
            </p>
          </div>
        </section>

        {/* Kalkulator Simulasi Interaktif & Rumus */}
        <section className="space-y-8 max-w-5xl mx-auto">
          <OngkirCalculator />

          {/* Rumus & Aturan Pembulatan */}
          <div className="bg-white p-7 sm:p-9 rounded-2xl sm:rounded-3xl shadow-md space-y-4">
            <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
              Rumus & Ketentuan Pembulatan
            </h3>
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white font-mono text-sm sm:text-base">
              Ongkir = (Jarak × Rp 2.500) + (Berat × Rp 5.000)
            </div>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              *Semua hasil penjumlahan tarif kurir dibulatkan ke atas (round up) ke kelipatan <strong>Rp 5.000</strong> terdekat demi kemudahan pembayaran dan penyesuaian operasional kurir lokal Surabaya.
            </p>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center pt-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/panduan/keamanan-cod"
              className="px-6 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Pelajari Keamanan & Titik Temu COD &rarr;
            </Link>
            <Link
              href="/faq"
              className="px-6 py-3.5 rounded-xl bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Pertanyaan Umum (FAQ)
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
