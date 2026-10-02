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
            Cara Menjual Barang di BaranginAja
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            Ubah perabot kos, buku kuliah, dan elektronik yang sudah tidak terpakai menjadi uang tunai dengan cepat dan tanpa potongan komisi di 31 kecamatan Kota Surabaya.
          </p>
        </section>

        {/* 3 Kolom Keunggulan Penjual (Cards Bersih tanpa Outline dengan Shadow) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {sellerAdvantages.map((adv, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-7 sm:p-8 flex flex-col space-y-3.5 sm:space-y-4"
            >
              <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
                {adv.title}
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                {adv.desc}
              </p>
            </div>
          ))}
        </section>

        {/* 5 Langkah Mudah Menjual */}
        <section className="space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
              style={{
                fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
                fontWeight: 300,
              }}
            >
              Langkah Mudah Menjual
            </h2>
            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Ikuti panduan berikut agar barang bekas Anda cepat laku dan bertransaksi dengan nyaman.
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8"
              >
                <div
                  className="shrink-0 text-3xl sm:text-4xl lg:text-5xl tracking-normal text-zinc-300 select-none leading-none font-light"
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
          </div>
        </section>

        {/* CTA Bawah */}
        <section className="text-center pt-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/jual"
              className="px-6 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Pasang Iklan Barang Sekarang &rarr;
            </Link>
            <Link
              href="/panduan/daftar-penjual"
              className="px-6 py-3.5 rounded-xl bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Info Akun Penjual Terdaftar
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
