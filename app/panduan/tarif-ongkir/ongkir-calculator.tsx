"use client";

import { useState } from "react";

export function OngkirCalculator() {
  const [distanceKm, setDistanceKm] = useState<number>(3);
  const [weightKg, setWeightKg] = useState<number>(1);

  const baseJarak = distanceKm * 2500;
  const baseBerat = weightKg * 5000;
  const rawTotal = baseJarak + baseBerat;
  const roundedTotal = Math.ceil(rawTotal / 5000) * 5000;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-xs space-y-6">
      <div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Simulasi Mandiri
        </span>
        <h3 className="text-xl font-bold text-zinc-950 mt-1">
          Kalkulator Estimasi Ongkos Kirim
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1">
          Geser atau masukkan perkiraan jarak dan berat untuk melihat estimasi ongkir otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Input Jarak */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-zinc-700">Perkiraan Jarak</span>
            <span className="font-mono font-bold text-zinc-950">{distanceKm} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full accent-zinc-900 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>1 km (Dekat)</span>
            <span>15 km</span>
            <span>30 km (Antar Ujung Surabaya)</span>
          </div>
        </div>

        {/* Input Berat */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-zinc-700">Perkiraan Berat Barang</span>
            <span className="font-mono font-bold text-zinc-950">{weightKg} kg</span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full accent-zinc-900 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>1 kg</span>
            <span>7 kg</span>
            <span>15 kg (Perabot/Elektronik Berat)</span>
          </div>
        </div>
      </div>

      {/* Hasil Perhitungan */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-3 border-b border-zinc-200/80 text-xs sm:text-sm">
          <div>
            <span className="text-zinc-500 block">Biaya Jarak:</span>
            <span className="font-semibold text-zinc-800">
              {distanceKm} km × Rp 2.500 = Rp {baseJarak.toLocaleString("id-ID")}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Biaya Berat:</span>
            <span className="font-semibold text-zinc-800">
              {weightKg} kg × Rp 5.000 = Rp {baseBerat.toLocaleString("id-ID")}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Subtotal Dasar:</span>
            <span className="font-semibold text-zinc-800">
              Rp {rawTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Tarif Ongkir Kurir
            </span>
            <p className="text-xs text-zinc-500">
              (Setelah pembulatan ke kelipatan Rp 5.000 terdekat)
            </p>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-950">
            Rp {roundedTotal.toLocaleString("id-ID")}
          </div>
        </div>
      </div>
    </div>
  );
}
