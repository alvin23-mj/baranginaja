import Link from "next/link";

export const metadata = {
  title: "Pusat Bantuan - BaranginAja",
  description: "Pertanyaan umum dan panduan bertransaksi di BaranginAja",
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
      a: "Untuk transaksi COD langsung antar pembeli & penjual, tidak dikenakan biaya platform. Anda dapat bertransaksi dengan bebas dan hemat.",
    },
    {
      q: "Bagaimana jika ada kendala dengan pembeli atau penjual?",
      a: "Anda dapat melaporkan pengguna atau produk yang bermasalah melalui fitur kontak admin atau fitur laporan di halaman detail produk.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-semibold">
            <svg className="h-3.5 w-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Bantuan &amp; FAQ
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
            Pusat Bantuan BaranginAja
          </h1>
          <p className="text-zinc-600">
            Temukan jawaban cepat untuk pertanyaan seputar jual beli di BaranginAja.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-zinc-200/80 space-y-2"
            >
              <h3 className="text-base font-bold text-zinc-900">{item.q}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors text-sm"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
