import Link from "next/link";

export const metadata = {
  title: "Panduan Cara Membeli - BaranginAja",
  description:
    "Panduan lengkap cara mencari, menawar, dan membeli barang bekas dengan aman di BaranginAja Surabaya.",
};

export default function CaraMembeliPage() {
  const steps = [
    {
      number: "01",
      title: "Cari & Filter Berdasarkan Kecamatan Terdekat",
      desc: "Gunakan fitur pencarian dan filter kategori atau pilih salah satu dari 31 kecamatan di Kota Surabaya. Memilih barang yang dekat dengan tempat tinggal atau kampus Anda akan menghemat waktu dan mempermudah janji COD.",
    },
    {
      number: "02",
      title: "Cek Detail, Foto & Deskripsi Barang",
      desc: "Perhatikan foto produk dari berbagai sudut, baca keterangan kondisi (apakah ada minus pemakaian, kelengkapan aksesoris, atau buku garansi), serta reputasi domisili penjual.",
    },
    {
      number: "03",
      title: "Hubungi Penjual Langsung",
      desc: "Gunakan tombol WhatsApp di halaman produk untuk menghubungi penjual secara langsung. Anda bisa menanyakan ketersediaan barang, mengajukan negosiasi harga secara sopan, atau memastikan kondisi fisik.",
    },
    {
      number: "04",
      title: "Sepakati Metode Penyerahan & Titik Temu",
      desc: "Pilih opsi COD (Cash on Delivery) bebas biaya di tempat umum yang aman (seperti perpustakaan kampus, lobi fakultas, kantin, minimarket 24 jam, atau taman kota Surabaya). Alternatif lain, Anda dapat menggunakan opsi kurir lokal yang transparan.",
    },
    {
      number: "05",
      title: "Periksa Fisik Barang Sebelum Membayar",
      desc: "Saat bertemu langsung, luangkan waktu untuk memeriksa fisik, fungsi, dan kelengkapan barang sebelum menyerahkan uang. Transaksi selesai dengan tenang tanpa rasa khawatir.",
    },
  ];

  const buyerTips = [
    {
      title: "Pilih Lokasi Publik yang Ramai",
      desc: "Jangan pernah menyepakati pertemuan di tempat sepi atau rumah orang yang tidak dikenal sendirian.",
    },
    {
      title: "Uji Fungsi di Tempat",
      desc: "Untuk barang elektronik, bawalah power bank atau cari titik temu yang memiliki stopkontak untuk menguji fungsinya.",
    },
    {
      title: "Siapkan Uang Pas",
      desc: "Jika membayar dengan tunai saat COD, bawa uang dengan nominal pas untuk mempercepat proses pembayaran.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Breadcrumbs & Title */}
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
            <span className="text-zinc-900 font-semibold">Cara Membeli</span>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-800 shadow-2xs">
              Panduan Pembeli
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Cara Membeli Barang di BaranginAja
            </h1>
            <p className="text-zinc-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              Panduan langkah demi langkah untuk mendapatkan barang bekas berkualitas dengan aman, hemat, dan praktis di Kota Surabaya.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-start gap-4 sm:gap-6"
            >
              <span className="shrink-0 text-2xl sm:text-3xl font-black text-zinc-300 font-mono">
                {step.number}
              </span>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-bold text-zinc-900">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Pembeli */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-zinc-950">
              Tips Penting Saat Membeli
            </h2>
            <p className="text-sm text-zinc-600">
              Perhatikan hal-hal berikut demi kelancaran dan keamanan transaksi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buyerTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-zinc-50 p-5 rounded-xl border border-zinc-200/60 space-y-2"
              >
                <h4 className="text-sm font-bold text-zinc-900">{tip.title}</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center pt-2 pb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/produk"
              className="px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Mulai Cari Barang di Katalog
            </Link>
            <Link
              href="/panduan/keamanan-cod"
              className="px-6 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-800 text-sm font-semibold hover:bg-zinc-100 transition-colors"
            >
              Baca Panduan Keamanan COD
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
