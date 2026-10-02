import Link from "next/link";

export const metadata = {
  title: "Pertanyaan Umum (FAQ) - BaranginAja",
  description: "Daftar pertanyaan yang sering diajukan mengenai jual beli, pengiriman, dan keamanan di BaranginAja Surabaya",
};

export default function FaqPage() {
  const faqCategories = [
    {
      category: "Jual & Beli",
      items: [
        {
          q: "Bagaimana cara mulai menjual barang di BaranginAja?",
          a: "Klik tombol 'Jual Barang' di bagian navbar atas atau menu profil. Unggah foto produk asli, masukkan judul, deskripsi barang, kondisi (baru/bekas), kategori, dan harga. Iklan Anda akan langsung tayang dan dapat dilihat oleh warga serta mahasiswa se-Surabaya.",
        },
        {
          q: "Apakah ada potongan komisi atau biaya admin platform?",
          a: "Tidak ada sama sekali! BaranginAja 100% bebas komisi transaksi. Semua uang hasil penjualan barang bekas Anda masuk utuh ke kantong atau rekening Anda.",
        },
        {
          q: "Bagaimana cara menghubungi penjual untuk membeli barang?",
          a: "Di setiap halaman detail produk terdapat tombol 'Beli / Chat WhatsApp'. Anda bisa langsung terhubung ke WhatsApp penjual untuk bertanya, menawar, atau menentukan janji COD.",
        },
      ],
    },
    {
      category: "Keamanan & COD",
      items: [
        {
          q: "Di mana lokasi terbaik untuk COD di Surabaya?",
          a: "Pilihlah tempat umum yang ramai dan terang seperti lobi kampus (ITS, UNAIR, UNESA, UPN, dll.), minimarket, SPBU, atau pusat perbelanjaan di 31 kecamatan Kota Surabaya.",
        },
        {
          q: "Bagaimana cara memastikan barang sesuai deskripsi saat COD?",
          a: "Periksa kondisi fisik dan fungsi barang secara langsung di depan penjual sebelum menyerahkan uang. Jangan ragu membatalkan transaksi jika kondisi tidak sesuai kesepakatan.",
        },
        {
          q: "Apakah pengguna terverifikasi domisilinya?",
          a: "Ya, setiap pengguna dan produk diklasifikasikan berdasarkan kecamatan dan kampus terdekat di Surabaya untuk memastikan kenyamanan transaksi lokal.",
        },
      ],
    },
    {
      category: "Pengiriman & Ongkir",
      items: [
        {
          q: "Berapa tarif ongkos kirim jika menggunakan kurir?",
          a: "Tarif kurir dihitung transparan: Tarif Jarak (Rp 2.500/km) + Tarif Berat (Rp 5.000/kg), dengan pembulatan ke kelipatan Rp 5.000 terdekat. Untuk COD tatap muka, ongkos kirim Rp 0 (Gratis).",
        },
        {
          q: "Bisakah memilih pengiriman selain COD?",
          a: "Bisa, pembeli dan penjual bebas menyepakati pengiriman melalui ojek online lokal atau ekspedisi instan di wilayah Surabaya.",
        },
      ],
    },
    {
      category: "Dukungan & Komunitas",
      items: [
        {
          q: "Bagaimana cara mendukung kelangsungan website BaranginAja?",
          a: "BaranginAja dibuat gratis untuk membantu warga dan mahasiswa Surabaya. Anda dapat mendukung kami melalui Saweria/Tako via menu 'Beri Kami Semangat' atau memberikan ulasan di 'Rating Kepuasan Website'.",
        },
        {
          q: "Ke mana saya harus melapor jika menemukan indikasi penipuan?",
          a: "Gunakan tombol laporan di halaman produk atau hubungi admin kami melalui Pusat Bantuan di halaman Hubungi Kami.",
        },
      ],
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
            Pertanyaan Umum (FAQ)
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            Semua yang perlu Anda ketahui tentang jual beli barang bekas aman, hemat, dan tanpa potongan di Kota Surabaya.
          </p>
        </section>

        {/* Categories & FAQs Accordion List */}
        <section className="space-y-12 sm:space-y-16 max-w-5xl mx-auto">
          {faqCategories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-6">
              <h2
                className="text-2xl sm:text-3xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-snug"
                style={{
                  fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
                  fontWeight: 300,
                }}
              >
                {cat.category}
              </h2>

              <div className="space-y-4">
                {cat.items.map((item, itemIdx) => (
                  <details
                    key={itemIdx}
                    className="group bg-white rounded-2xl sm:rounded-3xl shadow-md p-6 sm:p-8 transition-shadow list-none"
                  >
                    <summary className="font-normal text-lg sm:text-xl text-zinc-900 cursor-pointer list-none flex items-center justify-between gap-4 select-none">
                      <span>{item.q}</span>
                      <span className="text-zinc-400 transition-transform duration-200 group-open:rotate-180 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-4 text-sm sm:text-base text-zinc-600 leading-relaxed pt-3 border-t border-zinc-100">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* CTA Bawah */}
        <section className="text-center pt-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://saweria.co"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Beri Kami Semangat &rarr;
            </a>
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
