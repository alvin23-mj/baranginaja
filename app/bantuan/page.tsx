import Link from "next/link";

export const metadata = {
  title: "Pusat Bantuan - BaranginAja",
  description: "Pertanyaan umum dan panduan bertransaksi di BaranginAja Surabaya.",
};

export default function BantuanPage() {
  const faqs = [
    {
      q: "Bagaimana cara bertransaksi aman di BaranginAja?",
      a: "Selalu pastikan Anda bertransaksi dengan pengguna yang domisili kecamatannya terverifikasi. Untuk transaksi COD, pilih tempat umum di area Surabaya seperti minimarket, taman kota, atau kampus.",
    },
    {
      q: "Bagaimana cara mulai menjual barang?",
      a: "Klik tombol 'Jual Barang' di bagian atas navbar, unggah foto produk, isi nama barang, kondisi, harga, dan deskripsi singkat. Barang Anda akan langsung tampil di katalog warga dan mahasiswa se-Surabaya.",
    },
    {
      q: "Apakah ada biaya administrasi?",
      a: "Untuk transaksi COD langsung antar pembeli & penjual, tidak dikenakan biaya platform. Anda dapat bertransaksi dengan bebas dan hemat tanpa potongan sepeser pun.",
    },
    {
      q: "Bagaimana jika ada kendala dengan pembeli atau penjual?",
      a: "Anda dapat melaporkan pengguna atau produk yang bermasalah melalui fitur kontak admin atau fitur laporan di halaman detail produk.",
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
            Pusat Bantuan BaranginAja
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            Temukan jawaban cepat untuk pertanyaan seputar jual beli dan bantuan bertransaksi di 31 kecamatan Kota Surabaya.
          </p>
        </section>

        {/* Daftar Pertanyaan Bantuan (Cards Bersih tanpa Outline dengan Shadow) */}
        <section className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-7 sm:p-9 space-y-3"
            >
              <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 leading-snug">
                {item.q}
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </section>

        {/* CTA Bawah */}
        <section className="text-center pt-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/faq"
              className="px-6 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Lihat Semua Pertanyaan Umum (FAQ) &rarr;
            </Link>
            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
