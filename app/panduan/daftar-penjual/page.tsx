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
    "Memiliki akun terdaftar di BaranginAja (bisa daftar dengan email Google atau email kampus).",
    "Melengkapi informasi profil: Nama lengkap, nomor WhatsApp aktif untuk dihubungi pembeli, dan kecamatan domisili di Surabaya.",
    "Menyetujui kode etik komunitas: Menjual barang milik pribadi secara jujur dan tidak menjual barang terlarang/ilegal.",
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
            Bergabung Menjadi Penjual di BaranginAja
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            Mulai jualan barang kos, perlengkapan studi, atau perkakas bekas Anda sekarang. Cepat, aman, dan tanpa potongan perantara di 31 kecamatan Surabaya.
          </p>
        </section>

        {/* Keuntungan Penjual */}
        <section className="space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
              style={{
                fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
                fontWeight: 300,
              }}
            >
              Keuntungan Penjual Terverifikasi
            </h2>
            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Manfaat utama yang Anda dapatkan saat membuka lapak jual beli di BaranginAja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
            {benefits.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-7 sm:p-8 flex flex-col space-y-3 sm:space-y-3.5"
              >
                <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Syarat & Ketentuan */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-8 sm:p-10 space-y-6">
            <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
              Syarat Mudah Menjadi Penjual
            </h3>
            <div className="space-y-4">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 font-mono mt-0.5">
                    0{idx + 1}
                  </span>
                  <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                    {req}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Bawah */}
        <section className="text-center pt-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/jual"
              className="px-6 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Mulai Pasang Iklan Sekarang &rarr;
            </Link>
            <Link
              href="/panduan/cara-menjual"
              className="px-6 py-3.5 rounded-xl bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Baca Panduan Cara Menjual
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
