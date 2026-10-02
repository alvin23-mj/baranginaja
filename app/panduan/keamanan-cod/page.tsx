import Link from "next/link";

export const metadata = {
  title: "Panduan Keamanan & COD - BaranginAja",
  description:
    "Panduan bertransaksi aman, memilih titik temu publik di Surabaya, dan menghindari penipuan saat jual beli barang bekas.",
};

export default function KeamananCodPage() {
  const safeSpots = [
    {
      title: "Lingkungan Kampus Surabaya",
      desc: "Lobi fakultas, perpustakaan pusat, kantin kampus, atau pos keamanan kampus ternama (ITS, UNAIR, UNESA, UPN Veteran Jatim, UK Petra, UBAYA, dll.).",
    },
    {
      title: "Minimarket Waralaba 24 Jam",
      desc: "Pilih minimarket yang ramai, memiliki penerangan terang, dan dilengkapi CCTV di area parkir atau teras.",
    },
    {
      title: "Taman Kota & Ruang Publik",
      desc: "Taman Bungkul, Taman Apsari, Balai Pemuda, atau ruang terbuka hijau yang ramai warga beraktivitas di siang atau sore hari.",
    },
    {
      title: "Pusat Perbelanjaan & Food Court",
      desc: "Area terbuka food court mall atau atrium perbelanjaan di wilayah kecamatan terdekat.",
    },
  ];

  const safetyRules = [
    {
      title: "1. Bertemu di Jam Wajar & Tempat Ramai",
      desc: "Hindari janjian COD pada larut malam atau di tempat sepi, gang sempit, dan kos/rumah pribadi orang yang belum Anda kenal.",
    },
    {
      title: "2. Jangan Bayar Uang Muka (DP) Mencurigakan",
      desc: "Untuk transaksi COD langsung, bayarlah secara utuh hanya setelah Anda memeriksa dan memegang langsung barang tersebut.",
    },
    {
      title: "3. Periksa Fisik & Uji Fungsi di Depan Penjual",
      desc: "Buka kemasan, nyalakan elektronik, periksa kelengkapan, dan pastikan tidak ada cacat tersembunyi sebelum uang diserahkan.",
    },
    {
      title: "4. Verifikasi Mutasi Rekening Nyata",
      desc: "Bagi penjual: Jika pembeli membayar via transfer bank atau QRIS, selalu periksa mutasi saldo di aplikasi m-banking Anda sendiri, jangan hanya percaya pada tangkapan layar bukti transfer pembeli.",
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
            Panduan Transaksi Aman & Titik Temu COD
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            Kenyamanan dan rasa aman adalah pondasi komunitas BaranginAja. Ikuti panduan praktis berikut sebelum melakukan serah terima barang di wilayah Surabaya.
          </p>
        </section>

        {/* 4 Aturan Utama Bertransaksi Aman */}
        <section className="space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
              style={{
                fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
                fontWeight: 300,
              }}
            >
              Aturan Utama Bertransaksi Aman
            </h2>
            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Langkah perlindungan dasar agar pembeli maupun penjual bertransaksi dengan penuh keyakinan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
            {safetyRules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-7 sm:p-8 flex flex-col space-y-3 sm:space-y-3.5"
              >
                <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
                  {rule.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Rekomendasi Titik Temu di Surabaya */}
        <section className="space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
              style={{
                fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
                fontWeight: 300,
              }}
            >
              Rekomendasi Titik Temu (Safe Points)
            </h2>
            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Titik temu publik yang netral, mudah dijangkau transportasi, dan aman untuk serah terima barang di Surabaya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
            {safeSpots.map((spot, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-7 sm:p-8 flex flex-col space-y-3 sm:space-y-3.5"
              >
                <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
                  {spot.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {spot.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Kotak Bantuan & Laporan */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-8 sm:p-10 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
                Menemukan Indikasi Penipuan?
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Tim BaranginAja senantiasa menjaga kebersihan platform dari oknum nakal. Laporkan segera ke Pusat Bantuan jika menemukan akun mencurigakan.
              </p>
            </div>
            <Link
              href="/bantuan"
              className="shrink-0 px-6 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Laporkan Masalah ke Bantuan &rarr;
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
