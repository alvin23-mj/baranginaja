"use client";

import { useState, useMemo } from "react";
import { formatRupiah, calculateHargaJual } from "@/lib/pricing";

export interface DashboardOrderProfitData {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  total_harga: number;
  ongkir: number | null;
  opsi_pengiriman: string;
  product: {
    harga_input: number;
    harga_jual?: number | null;
  } | null;
}

interface DashboardProfitChartProps {
  completedOrders: DashboardOrderProfitData[];
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function DashboardProfitChart({ completedOrders }: DashboardProfitChartProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const availableYears = [2024, 2025, 2026, 2027];

  // Number of days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Filter completed orders for selected month and year
  // Single-pass O(N) calculation for monthly summary & daily map with useMemo
  const { selectedMonthMarkupProfit, selectedMonthOngkirProfit, dailyMap } = useMemo(() => {
    let markupSum = 0;
    let ongkirSum = 0;
    const map = new Map<number, { markupProfit: number; ongkirProfit: number }>();

    completedOrders.forEach((order) => {
      const dateStr = order.completed_at || order.created_at;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (date.getMonth() === selectedMonth && date.getFullYear() === selectedYear) {
        const hargaInput = order.product?.harga_input ?? 0;
        const hargaJual =
          order.product?.harga_jual ?? calculateHargaJual(hargaInput).hargaJual;
        const markup = Math.max(0, hargaJual - hargaInput);
        const ongkir = order.opsi_pengiriman === "kurir" ? order.ongkir ?? 0 : 0;

        markupSum += markup;
        ongkirSum += ongkir;

        const day = date.getDate();
        const existing = map.get(day) || { markupProfit: 0, ongkirProfit: 0 };
        map.set(day, {
          markupProfit: existing.markupProfit + markup,
          ongkirProfit: existing.ongkirProfit + ongkir,
        });
      }
    });

    return {
      selectedMonthMarkupProfit: markupSum,
      selectedMonthOngkirProfit: ongkirSum,
      dailyMap: map,
    };
  }, [completedOrders, selectedMonth, selectedYear]);

  const selectedMonthTotalProfit = selectedMonthMarkupProfit + selectedMonthOngkirProfit;

  // Daily breakdown
  const dailyBreakdown = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const data = dailyMap.get(day) || { markupProfit: 0, ongkirProfit: 0 };
      const totalProfit = data.markupProfit + data.ongkirProfit;
      return { day, markupProfit: data.markupProfit, ongkirProfit: data.ongkirProfit, totalProfit };
    });
  }, [daysInMonth, dailyMap]);

  // Maximum daily value for scale (at least 50.000 for standard scale if values are small)
  const maxDailyFound = Math.max(...dailyBreakdown.map((d) => d.totalProfit));
  const maxDailyProfit = Math.max(50000, maxDailyFound);

  return (
    <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header section with icon, title, and selectors */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-tight text-zinc-950 dark:text-zinc-50">
              GRAFIK TREN KEUNTUNGAN PLATFORM
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Riwayat estimasi keuntungan dari Markup Harga &amp; Ongkir Pengiriman Kurir untuk{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>
            </p>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          <select
            suppressHydrationWarning
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-950 shadow-xs focus:border-zinc-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>

          <select
            suppressHydrationWarning
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-950 shadow-xs focus:border-zinc-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                Tahun {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Card 1: Total Keuntungan Bulan Ini */}
        <div className="relative rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              TOTAL KEUNTUNGAN BULAN INI
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-xl font-bold text-zinc-950 dark:text-zinc-50">
            {formatRupiah(selectedMonthTotalProfit)}
          </p>
        </div>

        {/* Card 2: Profit dari Markup Harga */}
        <div className="relative rounded-lg border border-emerald-200/80 bg-emerald-50/60 p-4 shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              PROFIT DARI MARKUP HARGA
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatRupiah(selectedMonthMarkupProfit)}
          </p>
        </div>

        {/* Card 3: Profit dari Ongkir Kurir */}
        <div className="relative rounded-lg border border-sky-200/80 bg-sky-50/60 p-4 shadow-2xs dark:border-sky-900/50 dark:bg-sky-950/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              PROFIT DARI ONGKIR KURIR
            </span>
            <span className="text-sky-600 dark:text-sky-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-xl font-bold text-sky-700 dark:text-sky-400">
            {formatRupiah(selectedMonthOngkirProfit)}
          </p>
        </div>
      </div>

      {/* Daily Bar Chart Box */}
      <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between pb-3 text-xs">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            Diagram Batang Harian ({MONTH_NAMES[selectedMonth]} {selectedYear})
          </span>
          <span className="font-medium text-zinc-500 dark:text-zinc-400">
            Maks Harian: {formatRupiah(maxDailyProfit)}
          </span>
        </div>

        {/* Chart Bars Grid */}
        <div className="mt-2 flex h-64 items-end gap-1.5 overflow-x-auto pt-20 pb-3 px-3 scrollbar-thin">
          {dailyBreakdown.map((item) => {
            const heightPercent =
              item.totalProfit > 0
                ? Math.max(8, Math.min(100, Math.round((item.totalProfit / maxDailyProfit) * 100)))
                : 0;

            const markupPercent =
              item.totalProfit > 0
                ? Math.round((item.markupProfit / item.totalProfit) * 100)
                : 100;

            const isEarly = item.day <= 3;
            const isLate = item.day >= daysInMonth - 2;
            const positionClass = isEarly
              ? "left-0 items-start"
              : isLate
              ? "right-0 items-end"
              : "left-1/2 -translate-x-1/2 items-center";
            const arrowClass = isEarly ? "ml-3" : isLate ? "mr-3" : "";

            return (
              <div
                key={item.day}
                className="group relative flex flex-1 min-w-[22px] flex-col items-center h-full justify-end"
              >
                {/* Bar Track */}
                <div className="relative flex w-full flex-1 items-end justify-center rounded-xs bg-zinc-200/50 dark:bg-zinc-800/50">
                  {/* Tooltip on Hover */}
                  <div
                    className={`pointer-events-none absolute bottom-full mb-1.5 hidden group-hover:flex flex-col z-30 ${positionClass}`}
                  >
                    <div className="whitespace-nowrap rounded-lg bg-zinc-950 px-3 py-2 text-[11px] text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-950 font-medium border border-zinc-800 dark:border-zinc-200">
                      <p className="font-bold border-b border-zinc-800 dark:border-zinc-300 pb-1 mb-1 text-zinc-100 dark:text-zinc-900">
                        {item.day} {MONTH_NAMES[selectedMonth]} {selectedYear}
                      </p>
                      <div className="space-y-0.5">
                        <p className="flex items-center justify-between gap-3">
                          <span className="text-zinc-400 dark:text-zinc-600">Total:</span>
                          <span className="font-semibold">{formatRupiah(item.totalProfit)}</span>
                        </p>
                        <p className="flex items-center justify-between gap-3 text-emerald-400 dark:text-emerald-600">
                          <span>Markup:</span>
                          <span className="font-semibold">{formatRupiah(item.markupProfit)}</span>
                        </p>
                        <p className="flex items-center justify-between gap-3 text-sky-400 dark:text-sky-600">
                          <span>Ongkir:</span>
                          <span className="font-semibold">{formatRupiah(item.ongkirProfit)}</span>
                        </p>
                      </div>
                    </div>
                    <div className={`h-2 w-2 rotate-45 bg-zinc-950 dark:bg-zinc-100 -mt-1 ${arrowClass}`} />
                  </div>

                  {item.totalProfit > 0 ? (
                    <div
                      className="w-full flex flex-col justify-end transition-all duration-300 rounded-t-xs overflow-hidden"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Ongkir Portion */}
                      {item.ongkirProfit > 0 && (
                        <div
                          className="w-full bg-sky-500 transition-all"
                          style={{ height: `${100 - markupPercent}%` }}
                        />
                      )}
                      {/* Markup Portion */}
                      {item.markupProfit > 0 && (
                        <div
                          className="w-full bg-emerald-500 transition-all"
                          style={{ height: `${markupPercent}%` }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="h-1 w-full bg-zinc-300/40 dark:bg-zinc-700/40" />
                  )}
                </div>

                {/* Day label */}
                <span className="mt-2 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
