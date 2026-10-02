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
            Cara Membeli Barang di BaranginAja
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            Panduan langkah demi langkah untuk mendapatkan barang bekas berkualitas dengan aman, hemat, dan praktis di 31 kecamatan Kota Surabaya.
          </p>
        </section>

        {/* Daftar Langkah-Langkah (Cards Bersih tanpa Outline dengan Shadow) */}
        <section className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8"
            >
              <div
                className="shrink-0 text-3xl sm:text-4xl lg:text-5xl tracking-normal text-zinc-300 select-none leading-none"
                style={{
                  fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
                  fontWeight: 300,
                }}
              >
                {step.number}
              </div>

              <div className="space-y-2 flex-1">
                <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Tips Penting Saat Membeli (3 Kolom Card Style Seperti Tentang Kami) */}
        <section className="space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
              style={{
                fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
                fontWeight: 300,
              }}
            >
              Tips Penting Saat Membeli
            </h2>
            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Perhatikan hal-hal berikut demi kelancaran dan keamanan bertransaksi langsung antar warga Surabaya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {buyerTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-7 sm:p-8 flex flex-col space-y-3.5 sm:space-y-4"
              >
                <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
                  {tip.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tombol Aksi Navigasi Bawah */}
        <section className="text-center pt-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/produk"
              className="px-6 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Mulai Cari Barang di Katalog &rarr;
            </Link>
            <Link
              href="/panduan/keamanan-cod"
              className="px-6 py-3.5 rounded-xl bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Baca Panduan Keamanan COD
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
