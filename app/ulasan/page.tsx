"use client";

import { useState } from "react";
import Link from "next/link";

export default function RatingWebsitePage() {
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [ratingTags, setRatingTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const availableTags = [
    "Tampilan Rapi & Modern",
    "Cepat & Ringan Digunakan",
    "Pencarian & Filter Akurat",
    "Bebas Potongan Komisi (0%)",
    "Sangat Membantu Mahasiswa",
    "Transaksi COD Surabaya Praktis",
  ];

  const toggleTag = (tag: string) => {
    if (ratingTags.includes(tag)) {
      setRatingTags(ratingTags.filter((t) => t !== tag));
    } else {
      setRatingTags([...ratingTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header Breadcrumbs & Title */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-zinc-500 font-medium">
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/bantuan" className="hover:text-zinc-900 transition-colors">
              Dukungan
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Rating Kepuasan Website</span>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-zinc-200/80 text-xs font-semibold text-zinc-800 shadow-2xs">
              Ulasan Pengguna
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Rating Kepuasan Website
            </h1>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
              Pendapat dan masukan Anda sangat berarti bagi pengembangan BaranginAja agar semakin nyaman, aman, dan bermanfaat bagi seluruh warga dan mahasiswa di Surabaya.
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-zinc-200/80 shadow-xs">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                Ulasan Berhasil Terkirim
              </div>
              <h3 className="text-2xl font-bold text-zinc-950">
                Terima Kasih Banyak Atas Masukan Anda!
              </h3>
              <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                Penilaian Anda telah kami terima. Tim pengembang BaranginAja terus berkomitmen menghadirkan pengalaman jual beli barang bekas terbaik di 31 kecamatan Surabaya.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                >
                  Kembali ke Beranda
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setRatingScore(5);
                    setRatingTags([]);
                    setFeedback("");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  Kirim Ulasan Lain
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="space-y-2 text-center pb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                  Bagaimana Pengalaman Anda Menggunakan BaranginAja?
                </label>
                <div className="flex items-center justify-center gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (ratingHover || ratingScore) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => setRatingScore(star)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer text-2xl sm:text-3xl font-bold"
                        aria-label={`Beri bintang ${star}`}
                      >
                        <span className={active ? "text-amber-500" : "text-zinc-300"}>
                          ★
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-semibold text-zinc-700">
                  {ratingScore === 5 && "Sangat Puas & Membantu Sekali"}
                  {ratingScore === 4 && "Puas dan Bagus"}
                  {ratingScore === 3 && "Cukup Baik"}
                  {ratingScore === 2 && "Kurang Memuaskan"}
                  {ratingScore === 1 && "Perlu Banyak Peningkatan"}
                </p>
              </div>

              {/* Tag Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                  Apa yang Paling Anda Apresiasi?
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const selected = ratingTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                          selected
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Textarea Feedback */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                  Pesan, Saran, atau Ide Fitur Baru
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda, fitur yang diinginkan, atau kendala yang Anda temui..."
                  className="w-full rounded-2xl border border-zinc-300 bg-zinc-50/50 p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-950 focus:outline-hidden transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                >
                  Kirim Penilaian Anda
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
