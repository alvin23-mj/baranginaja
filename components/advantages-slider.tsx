"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AdvantageItem {
  id: number;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
}

const ADVANTAGES: AdvantageItem[] = [
  {
    id: 1,
    icon: (
      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    badge: "Keamanan",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    title: "Akun Mahasiswa Terverifikasi",
    description:
      "Seluruh penjual dan pembeli terdaftar dengan email kampus aktif demi rasa aman dan kepercayaan transaksi.",
  },
  {
    id: 2,
    icon: (
      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    badge: "Hemat",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "COD Kampus Bebas Ongkir",
    description:
      "Bisa janjian ketemuan langsung di perpustakaan, kantin, atau lobi fakultas dengan aman tanpa biaya tambahan (Rp 0).",
  },
  {
    id: 3,
    icon: (
      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 102 0 1 1 0 00-2 0zm-7 0a1 1 0 102 0 1 1 0 00-2 0z" />
      </svg>
    ),
    badge: "Transparan",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    title: "Tarif Kurir Terjangkau",
    description:
      "Biaya pengiriman jelas: tarif jarak Rp 2.500/km & berat Rp 5.000/kg yang dihitung otomatis oleh sistem.",
  },
  {
    id: 4,
    icon: (
      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    badge: "Kuliah",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Buku & Modul Preloved",
    description:
      "Hemat biaya kuliah dengan buku teks, diktat, dan buku referensi layak baca dari sesama rekan kampus.",
  },
  {
    id: 5,
    icon: (
      <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    badge: "Lengkap",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    title: "Elektronik & Perlengkapan Kos",
    description:
      "Temukan laptop, kalkulator, kipas angin, meja belajar, hingga perabotan kos dengan harga kantong mahasiswa.",
  },
  {
    id: 6,
    icon: (
      <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
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
