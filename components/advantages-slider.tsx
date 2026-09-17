"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AdvantageItem {
  id: number;
  icon: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
}

const ADVANTAGES: AdvantageItem[] = [
  {
    id: 1,
    icon: "🎓",
    badge: "Keamanan",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    title: "Akun Mahasiswa Terverifikasi",
    description:
      "Seluruh penjual dan pembeli terdaftar dengan email kampus aktif demi rasa aman dan kepercayaan transaksi.",
  },
  {
    id: 2,
    icon: "🤝",
    badge: "Hemat",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "COD Kampus Bebas Ongkir",
    description:
      "Bisa janjian ketemuan langsung di perpustakaan, kantin, atau lobi fakultas dengan aman tanpa biaya tambahan (Rp 0).",
  },
  {
    id: 3,
    icon: "🚚",
    badge: "Transparan",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    title: "Tarif Kurir Terjangkau",
    description:
      "Biaya pengiriman jelas: tarif jarak Rp 2.500/km & berat Rp 5.000/kg yang dihitung otomatis oleh sistem.",
  },
  {
    id: 4,
    icon: "📚",
    badge: "Kuliah",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Buku & Modul Preloved",
    description:
      "Hemat biaya kuliah dengan buku teks, diktat, dan buku referensi layak baca dari sesama rekan kampus.",
  },
  {
    id: 5,
    icon: "💻",
    badge: "Lengkap",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    title: "Elektronik & Perlengkapan Kos",
    description:
      "Temukan laptop, kalkulator, kipas angin, meja belajar, hingga perabotan kos dengan harga kantong mahasiswa.",
  },
  {
    id: 6,
    icon: "🛡️",
    badge: "Terpercaya",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    title: "Transaksi Aman Terlindungi",
    description:
      "Setiap pesanan terpantau transparan dan dana diteruskan ke penjual setelah barang diterima dengan baik.",
  },
];

export function AdvantagesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsiveness: compute visible items
  useEffect(() => {
    function updateItemsPerView() {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    }

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const totalPages = Math.max(1, ADVANTAGES.length - itemsPerView + 1);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 >= totalPages ? 0 : prev + 1));
  }, [totalPages]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? totalPages - 1 : prev - 1));
  }, [totalPages]);

  // Auto-slide effect (every 3.5 seconds when not hovered)
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  return (
    <div
      className="relative w-full py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header bar: Title & Controls */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Mengapa BaranginAja?
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight mt-0.5">
            Kelebihan Belanja &amp; Jual di Kampus
          </h2>
        </div>

        {/* Navigasi Panah Kiri / Kanan */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slider Viewport */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {ADVANTAGES.map((item) => (
            <div
              key={item.id}
              className="shrink-0 px-2 sm:px-2.5"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <div className="h-full rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-2xl shadow-2xs">
                      {item.icon}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-zinc-950 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <span>BaranginAja Eco</span>
                  <span>✓ Terverifikasi</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Buka slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx
                ? "w-7 bg-zinc-900"
                : "w-2 bg-zinc-300 hover:bg-zinc-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
