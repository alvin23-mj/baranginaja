import Link from "next/link";

export const metadata = {
  title: "Panduan Cara Menjual - BaranginAja",
  description:
    "Panduan lengkap cara memasang iklan barang bekas, menentukan harga, dan bertransaksi sukses di BaranginAja Surabaya.",
};

export default function CaraMenjualPage() {
  const steps = [
    {
      number: "01",
      title: "Siapkan Barang & Ambil Foto Jelas",
      desc: "Bersihkan barang Anda terlebih dahulu. Ambil foto di pencahayaan terang dari beberapa sudut: tampak depan, samping, dan detail kondisi tertentu (termasuk jika ada lecet atau cacat minor agar pembeli puas dengan keterbukaan Anda).",
    },
    {
      number: "02",
      title: "Pasang Iklan via Menu 'Jual Barang'",
      desc: "Klik tombol 'Jual Barang' di bagian atas navbar atau menu akun Anda. Masukkan nama barang yang jelas, pilih kategori yang tepat, tentukan kecamatan domisili Anda di Surabaya, dan tulis deskripsi informatif.",
    },
    {
      number: "03",
      title: "Tentukan Harga yang Bersahabat",
      desc: "Riset harga pasaran barang sejenis. Menentukan harga yang wajar dan ramah kantong mahasiswa/warga akan membuat barang Anda terjual jauh lebih cepat.",
    },
    {
      number: "04",
      title: "Respon Pesan Calon Pembeli",
      desc: "Saat ada calon pembeli menghubungi via WhatsApp, jawab pertanyaan dengan ramah dan terbuka. Sepakati apakah transaksi akan menggunakan COD langsung atau kurir.",
    },
    {
      number: "05",
      title: "Serah Terima Barang & Terima Pembayaran Utuh",
      desc: "Lakukan transaksi COD di tempat umum yang aman. Anda menerima 100% uang hasil penjualan tanpa potongan komisi sepeser pun dari BaranginAja.",
    },
  ];

  const sellerAdvantages = [
    {
      title: "0% Potongan Komisi",
      desc: "Seluruh hasil penjualan masuk langsung ke kantong Anda tanpa ada pemotongan biaya transaksi.",
    },
    {
      title: "Peminat Lokal Surabaya",
      desc: "Iklan Anda langsung dilihat oleh ribuan mahasiswa dan warga sekitar di 31 kecamatan.",
    },
    {
      title: "Proses Cepat 2 Menit",
      desc: "Formulir pasang barang yang ringkas dan mudah diakses langsung lewat ponsel pintar Anda.",
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
            <span className="text-zinc-900 font-semibold">Cara Menjual</span>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-800 shadow-2xs">
              Panduan Penjual
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Cara Menjual Barang Cepat Laku di BaranginAja
            </h1>
            <p className="text-zinc-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              Ubah perabot kos, buku kuliah, dan elektronik yang sudah tidak terpakai menjadi uang tunai dengan cepat dan tanpa potongan komisi.
            </p>
          </div>
        </div>

        {/* Keunggulan Penjual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sellerAdvantages.map((adv, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2"
            >
              <h3 className="text-base font-bold text-zinc-950">{adv.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {adv.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-950">
            5 Langkah Mudah Menjual
          </h2>
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

        {/* CTA */}
        <div className="text-center pt-2 pb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/jual"
              className="px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Pasang Iklan Barang Sekarang
            </Link>
            <Link
              href="/panduan/daftar-penjual"
              className="px-6 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-800 text-sm font-semibold hover:bg-zinc-100 transition-colors"
            >
              Info Akun Penjual Terdaftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
