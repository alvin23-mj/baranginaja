import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Tentang Kami - BaranginAja",
  description:
    "Mengenal BaranginAja, marketplace sirkular ekonomi terpercaya bagi mahasiswa dan warga di 31 kecamatan Kota Surabaya.",
};

export default function TentangKamiPage() {
  const metrics = [
    {
      label: "Cakupan Wilayah",
      value: "31",
      unit: "Kecamatan",
      desc: "Menghubungkan warga Surabaya dari barat hingga timur, utara hingga selatan.",
    },
    {
      label: "Potongan Platform",
      value: "0%",
      unit: "Komisi COD",
      desc: "Hasil penjualan 100% masuk kantong Anda tanpa potongan biaya perantara.",
    },
    {
      label: "Ekosistem Kampus",
      value: "10+",
      unit: "Kampus Surabaya",
      desc: "Komunitas aktif mahasiswa rantau dan lokal saling bertukar perlengkapan studi.",
    },
    {
      label: "Misi Keberlanjutan",
      value: "100%",
      unit: "Sirkular",
      desc: "Memperpanjang masa pakai barang guna menekan tumpukan limbah perabot & gadget.",
    },
  ];

  const coreValues = [
    {
      badge: "Keamanan",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      title: "Komunitas Terverifikasi & Aman",
      desc: "Kami mengutamakan transparansi data pengguna dengan pencatatan domisili kecamatan Kota Surabaya. Pembeli dan penjual bertransaksi dengan keyakinan penuh melalui titik temu publik yang aman.",
    },
    {
      badge: "Ekonomis",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      title: "Solusi Cerdas Hemat Pengeluaran",
      desc: "Mahasiswa baru maupun warga tidak perlu membeli barang baru yang mahal. Dapatkan buku referensi, meja lipat, kipas angin, hingga gadget layak pakai dengan harga ramah kantong.",
    },
    {
      badge: "Sirkular",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      title: "Gaya Hidup Berkelanjutan",
      desc: "Mendukung ekonomi sirkular lokal di Surabaya. Barang yang sudah tidak Anda pakai saat wisuda atau pindah kos bisa menjadi berkah berharga bagi orang lain yang sedang membutuhkan.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Unggah Produk Tanpa Biaya",
      desc: "Foto barang yang ingin Anda jual, tentukan harga wajar, dan sertakan deskripsi kondisi yang jujur.",
    },
    {
      number: "02",
      title: "Filter Kecamatan & Kampus",
      desc: "Calon pembeli dapat menemukan barang yang lokasinya paling dekat, menghemat waktu serta ongkos perjalanan.",
    },
    {
      number: "03",
      title: "COD di Titik Temu Publik Aman",
      desc: "Sepakati waktu dan lokasi bertemu yang nyaman di perpustakaan, kafe, minimarket, atau fasilitas umum Surabaya.",
    },
    {
      number: "04",
      title: "Cek Fisik & Transaksi Selesai",
      desc: "Periksa kondisi barang secara langsung sebelum pembayaran. Transaksi selesai tanpa rasa khawatir.",
    },
  ];

  return (
    <main className="flex-1 bg-[#f0f0f0] text-zinc-900">
      {/* 1. Hero Banner Full-Width (Ukuran Seragam dengan Katalog) */}
      <section className="w-full overflow-hidden bg-zinc-950">
        <Image
          src="/images/about-hero.jpg"
          alt="Tentang BaranginAja - Komunitas Jual Beli Mahasiswa & Warga Surabaya"
          width={1920}
          height={800}
          priority
          className="w-full h-auto object-cover max-h-[220px] sm:max-h-[280px] lg:max-h-[340px]"
        />
      </section>

      {/* 2. Konten Utama */}
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 space-y-16 sm:space-y-20">
        
        {/* Cerita & Latar Belakang */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-zinc-200/80 text-zinc-800 text-xs font-semibold shadow-2xs">
            Cerita & Nilai Kami
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
            Menghubungkan Warga & Mahasiswa Surabaya Lewat Jual Beli Berkelanjutan
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed pt-2">
            BaranginAja berawal dari satu masalah nyata: setiap tahun ajaran baru atau kelulusan, ribuan mahasiswa di Surabaya bingung menjual barang kos layak pakai, sementara mahasiswa baru dan warga membutuhkan perlengkapan dengan harga bersahabat. Kami hadir menjadi jembatan terpercaya di 31 kecamatan Kota Surabaya.
          </p>
        </section>

        {/* Statistik & Metrik Dampak */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {item.label}
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
                      {item.value}
                    </span>
                    <span className="text-sm font-semibold text-zinc-600">
                      {item.unit}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Pilar Nilai Utama */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Prinsip yang Selalu Kami Pegang
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base max-w-xl mx-auto">
              Tiga pondasi utama yang memastikan setiap interaksi jual beli di BaranginAja berlangsung aman, nyaman, dan berdaya guna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreValues.map((value, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col"
              >
                <div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${value.badgeColor}`}
                  >
                    {value.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{value.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed flex-1">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bagaimana Cara Kerjanya */}
        <section className="bg-white p-8 sm:p-10 lg:p-12 rounded-3xl border border-zinc-200/80 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Panduan Praktis
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950">
              Transaksi Mudah dalam 4 Langkah
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base">
              Mulai dari pasang iklan hingga serah terima barang di titik temu terdekat di Surabaya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative space-y-2">
                <span className="text-3xl sm:text-4xl font-black text-zinc-200">
                  {step.number}
                </span>
                <h4 className="text-base font-bold text-zinc-900">
                  {step.title}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Keamanan Titik Temu (Safety Box) */}
        <section className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-10 lg:p-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800 text-amber-400 text-xs font-semibold">
                Panduan Bertransaksi Aman
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Keamanan Anda Adalah Prioritas Utama Kami
              </h3>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Kami selalu menyarankan opsi Cash on Delivery (COD) langsung di tempat-tempat umum yang ramai di Kota Surabaya—seperti perpustakaan kampus, lobi fakultas, kantin, minimarket 24 jam, atau taman kota Surabaya.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/bantuan"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors"
              >
                Pusat Bantuan & FAQ
              </Link>
            </div>
          </div>
        </section>

        {/* Penutup / Call to Action */}
        <section className="text-center py-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            Siap Menjadi Bagian dari Komunitas BaranginAja?
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto text-sm sm:text-base">
            Temukan barang impian dengan harga mahasiswa atau ubah barang yang sudah tidak terpakai menjadi uang tunai hari ini.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/produk"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Jelajahi Katalog Produk &rarr;
            </Link>
            <Link
              href="/jual"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-800 font-semibold text-sm hover:bg-zinc-100 transition-colors"
            >
              Mulai Jual Barang
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
