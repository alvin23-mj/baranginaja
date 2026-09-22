import Link from "next/link";

export const metadata = {
  title: "Pertanyaan Umum (FAQ) - BaranginAja",
  description: "Daftar pertanyaan yang sering diajukan mengenai jual beli, pengiriman, dan keamanan di BaranginAja Surabaya",
};

export default function FaqPage() {
  const faqCategories = [
    {
      category: "Jual & Beli",
      icon: (
        <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
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
      icon: (
        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
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
      icon: (
        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 102 0 1 1 0 00-2 0zm-7 0a1 1 0 102 0 1 1 0 00-2 0z" />
        </svg>
      ),
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
      icon: (
        <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
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
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pusat Pertanyaan &amp; Jawaban
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
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 shrink-0">
                  {cat.icon}
                </span>
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
              <svg className="h-5 w-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Suka dengan BaranginAja?
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
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Beri Kami Semangat
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
