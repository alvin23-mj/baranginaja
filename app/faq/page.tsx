import Link from "next/link";

export const metadata = {
  title: "Pertanyaan Umum (FAQ) - BaranginAja",
  description: "Daftar pertanyaan yang sering diajukan mengenai jual beli, pengiriman, dan keamanan di BaranginAja Surabaya",
};

export default function FaqPage() {
  const faqCategories = [
    {
      category: "Jual & Beli",
      icon: "🛍️",
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
      icon: "🛡️",
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
      icon: "🚚",
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
      icon: "☕",
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
    <div className="min-h-screen bg-[#0f0f11] text-zinc-100 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-amber-400 text-xs font-semibold">
            <span>❓</span> Pusat Pertanyaan &amp; Jawaban
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Pertanyaan Umum (FAQ)
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Semua yang perlu Anda ketahui tentang jual beli barang bekas aman, hemat, dan tanpa potongan di Kota Surabaya.
          </p>
        </div>

        {/* Categories & FAQs Grid */}
        <div className="space-y-8">
          {faqCategories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                <span className="text-xl">{cat.icon}</span>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {cat.category}
                </h2>
              </div>

              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => (
                  <details
                    key={itemIdx}
                    className="group bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-4 sm:p-5 transition-all duration-150 open:border-zinc-700 open:bg-zinc-900"
                  >
                    <summary className="font-semibold text-zinc-200 hover:text-white cursor-pointer list-none flex items-center justify-between gap-4 select-none">
                      <span className="text-sm sm:text-base">{item.q}</span>
                      <span className="text-zinc-400 transition-transform duration-200 group-open:rotate-180 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed pt-2 border-t border-zinc-800/60">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Card: Saweria & Hubungi Kami */}
        <div className="rounded-2xl border border-zinc-800 bg-linear-to-r from-zinc-900 to-zinc-900/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <span>☕</span> Suka dengan BaranginAja?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              Dukung tim mahasiswa pengembang kami lewat donasi seikhlasnya atau beri kami masukan.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="https://saweria.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors shadow-sm"
            >
              <span>☕</span> Beri Kami Semangat
            </a>
            <Link
              href="/#hubungi-kami"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>

        {/* Back button */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition-colors text-sm"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
