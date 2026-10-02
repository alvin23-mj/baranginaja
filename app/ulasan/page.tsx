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
    <main className="flex-1 bg-[#f0f0f0] text-zinc-900">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 space-y-16 sm:space-y-20">
        {/* Header Editorial Title */}
        <section className="text-center max-w-4xl lg:max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
            style={{
              fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
              fontWeight: 300,
            }}
          >
            Rating Kepuasan Website
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            Pendapat dan masukan Anda sangat berarti bagi pengembangan platform BaranginAja agar semakin nyaman, aman, dan bermanfaat bagi seluruh warga dan mahasiswa di 31 kecamatan Kota Surabaya.
          </p>
        </section>

        {/* Card Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl shadow-md">
            {isSubmitted ? (
              <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  Ulasan Berhasil Terkirim
                </div>
                <h3 className="text-2xl sm:text-3xl font-normal text-zinc-950">
                  Terima Kasih Banyak Atas Masukan Anda!
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Penilaian Anda telah kami terima. Tim pengembang BaranginAja terus berkomitmen menghadirkan pengalaman jual beli barang bekas terbaik di Surabaya.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/"
                    className="px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
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
                    className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-800 text-sm font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    Kirim Ulasan Lain
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Star Rating */}
                <div className="space-y-3 text-center pb-2">
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
                          className="p-1 transition-transform hover:scale-110 cursor-pointer text-3xl sm:text-4xl font-bold"
                          aria-label={`Beri bintang ${star}`}
                        >
                          <span className={active ? "text-amber-500" : "text-zinc-200"}>
                            ★
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm font-medium text-zinc-700">
                    {ratingScore === 5 && "Sangat Puas & Membantu Sekali"}
                    {ratingScore === 4 && "Puas dan Bagus"}
                    {ratingScore === 3 && "Cukup Baik"}
                    {ratingScore === 2 && "Kurang Memuaskan"}
                    {ratingScore === 1 && "Perlu Banyak Peningkatan"}
                  </p>
                </div>

                {/* Tag Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                    Apa yang Paling Anda Apresiasi?
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {availableTags.map((tag) => {
                      const selected = ratingTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`text-xs sm:text-sm px-4 py-2 rounded-xl transition-all cursor-pointer font-medium ${
                            selected
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Textarea Feedback */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                    Pesan, Saran, atau Ide Fitur Baru
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda, fitur yang diinginkan, atau kendala yang Anda temui..."
                    className="w-full rounded-2xl bg-zinc-50 p-4 text-sm sm:text-base text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:outline-hidden transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex justify-center sm:justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                  >
                    Kirim Penilaian Anda &rarr;
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
