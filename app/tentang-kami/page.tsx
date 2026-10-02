import Image from "next/image";
import { AnimatedMetrics } from "./animated-metrics";

export const metadata = {
  title: "Tentang Kami - BaranginAja",
  description:
    "Mengenal BaranginAja, marketplace sirkular ekonomi terpercaya bagi mahasiswa dan warga di 31 kecamatan Kota Surabaya.",
};

export default function TentangKamiPage() {

  const coreValues = [
    {
      title: "Komunitas Terverifikasi & Aman",
      desc: "Kami mengutamakan transparansi data pengguna dengan pencatatan domisili kecamatan Kota Surabaya. Pembeli dan penjual bertransaksi dengan keyakinan penuh melalui titik temu publik yang aman.",
      image: "/images/about-value-1.jpg",
    },
    {
      title: "Solusi Cerdas Hemat Pengeluaran",
      desc: "Mahasiswa baru maupun warga tidak perlu membeli barang baru yang mahal. Dapatkan buku referensi, meja lipat, kipas angin, hingga gadget layak pakai dengan harga ramah kantong.",
      image: "/images/about-value-2.jpg",
    },
    {
      title: "Gaya Hidup Berkelanjutan",
      desc: "Mendukung ekonomi sirkular lokal di Surabaya. Barang yang sudah tidak Anda pakai saat wisuda atau pindah kos bisa menjadi berkah berharga bagi orang lain yang sedang membutuhkan.",
      image: "/images/about-value-3.jpg",
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
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 space-y-24 sm:space-y-32 lg:space-y-36">
        
        {/* Cerita & Latar Belakang */}
        <section className="text-center max-w-4xl lg:max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
            style={{
              fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
              fontWeight: 300,
            }}
          >
            Menghubungkan Warga & Mahasiswa Surabaya<br className="hidden md:inline" /> Lewat Jual Beli Berkelanjutan
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            BaranginAja berawal dari satu masalah nyata: setiap tahun ajaran baru atau kelulusan, ribuan mahasiswa di Surabaya bingung menjual barang kos layak pakai, sementara mahasiswa baru dan warga membutuhkan perlengkapan dengan harga bersahabat. Kami hadir menjadi jembatan terpercaya di 31 kecamatan Kota Surabaya.
          </p>
        </section>

        {/* Statistik & Metrik Dampak dengan Animasi Scroll & Center */}
        <AnimatedMetrics />

        {/* 3 Pilar Nilai Utama */}
        <section className="space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
              style={{
                fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
                fontWeight: 300,
              }}
            >
              Prinsip yang Selalu Kami Pegang
            </h2>
            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Tiga pondasi utama yang memastikan setiap interaksi jual beli di BaranginAja berlangsung aman, nyaman, dan berdaya guna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {coreValues.map((value, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-md overflow-hidden flex flex-col justify-between"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100">
                  <Image
                    src={value.image}
                    alt={value.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="p-7 sm:p-8 flex flex-col flex-1 space-y-3.5 sm:space-y-4">
                  <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
                    {value.title}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
