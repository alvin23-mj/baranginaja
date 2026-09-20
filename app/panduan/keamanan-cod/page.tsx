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
      title: "Taman Kota & Ruang Publik Surabaya",
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
      title: "2. Jangan Pernah Bayar Uang Muka (DP) Mencurigakan",
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
            <span className="text-zinc-900 font-semibold">Keamanan & COD</span>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-800 shadow-2xs">
              Prioritas Utama Kami
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Panduan Transaksi Aman & Titik Temu COD
            </h1>
            <p className="text-zinc-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              Kenyamanan dan rasa aman adalah pondasi komunitas BaranginAja. Ikuti panduan praktis berikut sebelum melakukan serah terima barang di wilayah Surabaya.
            </p>
          </div>
        </div>

        {/* 4 Aturan Emas Keamanan */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-950">
            4 Aturan Utama Bertransaksi Aman
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safetyRules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2"
              >
                <h3 className="text-base font-bold text-zinc-950">{rule.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendasi Titik Temu di Surabaya */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-zinc-950">
              Rekomendasi Titik Temu (Safe Meeting Points) di Surabaya
            </h2>
            <p className="text-sm text-zinc-600">
              Titik temu publik yang netral, mudah dijangkau kendaraan umum, dan aman untuk serah terima barang.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeSpots.map((spot, idx) => (
              <div
                key={idx}
                className="bg-zinc-50 p-5 rounded-xl border border-zinc-200/60 space-y-2"
              >
                <h4 className="text-sm font-bold text-zinc-900">{spot.title}</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {spot.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Kotak Bantuan & Laporan */}
        <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-10 space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold">
            Menemukan Indikasi Penipuan atau Akun Mencurigakan?
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Tim BaranginAja senantiasa menjaga kebersihan platform dari oknum nakal. Jika Anda menemukan iklan mencurigakan, harga tidak masuk akal, atau perilaku tidak menyenangkan dari pengguna lain, segera laporkan ke Pusat Bantuan kami.
          </p>
          <div className="pt-2">
            <Link
              href="/bantuan"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
            >
              Laporkan Masalah ke Bantuan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
