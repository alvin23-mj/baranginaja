import Link from "next/link";

export const metadata = {
  title: "Daftar Jadi Penjual - BaranginAja",
  description:
    "Cara mendaftar dan mengaktifkan akun penjual di marketplace BaranginAja Surabaya tanpa biaya.",
};

export default function DaftarPenjualPage() {
  const benefits = [
    {
      title: "100% Bebas Biaya Pendaftaran & Komisi",
      desc: "Tidak ada biaya registrasi ataupun potongan persenan dari setiap barang yang berhasil Anda jual. Uang sepenuhnya milik Anda.",
    },
    {
      title: "Jangkauan Komunitas Kampus & Warga Surabaya",
      desc: "Produk Anda langsung dapat dilihat oleh ribuan mahasiswa dari berbagai kampus besar di Surabaya (ITS, UNAIR, UNESA, UPN, UK Petra, UBAYA, dll.) serta warga di 31 kecamatan.",
    },
    {
      title: "Kelola Produk & Status Transaksi Mudah",
      desc: "Dashboard sederhana untuk memantau produk aktif, mengubah harga sewaktu-waktu, menandai barang yang sudah terjual, atau memperbarui foto.",
    },
    {
      title: "Kepercayaan Pembeli Tinggi",
      desc: "Akun penjual yang terdata domisilinya mendapatkan lencana terverifikasi, membuat calon pembeli lebih yakin dan cepat melakukan transaksi.",
    },
  ];

  const requirements = [
    "Memiliki akun terdaftar di BaranginAja (bisa daftar dengan email Google/kampus).",
    "Melengkapi informasi profil: Nama lengkap, nomor WhatsApp aktif untuk dihubungi pembeli, dan kecamatan domisili di Surabaya.",
    "Menyetujui kode etik komunitas: Menjual barang milik pribadi secara jujur dan tidak menjual barang terlarang/ilegal.",
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
            <span className="text-zinc-900 font-semibold">Daftar Jadi Penjual</span>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-800 shadow-2xs">
              Pendaftaran Penjual
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Bergabung Menjadi Penjual di BaranginAja
            </h1>
            <p className="text-zinc-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              Mulai jualan barang kos, perlengkapan studi, atau perkakas bekas Anda sekarang. Cepat, aman, dan tanpa potongan perantara.
            </p>
          </div>
        </div>

        {/* Card Keuntungan */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-950">
            Keuntungan Menjadi Penjual Terverifikasi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2"
              >
                <h3 className="text-base font-bold text-zinc-950">{item.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Syarat & Ketentuan */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-zinc-950">
            Syarat Mudah Menjadi Penjual
          </h2>
          <div className="space-y-3">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-mono mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm text-zinc-700 leading-relaxed">{req}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Banner */}
        <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-10 text-center space-y-5">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Sudah Siap Memasang Barang Pertama Anda?
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Hanya butuh 2 menit untuk melengkapi profil dan mulai memajang barang Anda di katalog mahasiswa &amp; warga Surabaya.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/profil"
              className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Lengkapi Profil Penjual
            </Link>
            <Link
              href="/jual/tambah"
              className="px-6 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 font-semibold text-sm hover:bg-zinc-700 transition-colors"
            >
              Pasang Iklan Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
