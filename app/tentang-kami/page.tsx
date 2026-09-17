import Link from "next/link";

export const metadata = {
  title: "Tentang Kami - BaranginAja",
  description:
    "Platform jual beli barang bekas terpercaya di 31 kecamatan Kota Surabaya",
};

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-semibold">
            📍 31 Kecamatan Kota Surabaya
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            Tentang BaranginAja
          </h1>
          <p className="text-zinc-600 max-w-2xl mx-auto text-base sm:text-lg">
            Marketplace terverifikasi yang memudahkan warga dan mahasiswa bertransaksi barang bekas secara aman, hemat, dan praktis di 31 kecamatan Kota Surabaya.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-zinc-200/80 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              🎯
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Misi Kami</h2>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Membangun ekosistem sirkular ekonomi lokal Surabaya agar barang-barang yang masih layak pakai seperti perabot rumah tangga, buku teks, perlengkapan hobi, hingga gadget dapat menemukan pemilik baru tanpa perantara ribet.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-zinc-200/80 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              🛡️
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Keamanan Terjamin</h2>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Setiap pengguna terdaftar dengan domisili kecamatan yang terdata. Bertransaksi menjadi lebih percaya diri dengan opsi COD langsung di titik temu yang aman atau lewat pembayaran terverifikasi.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-4">
          <Link
            href="/produk"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Jelajahi Katalog Produk &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
