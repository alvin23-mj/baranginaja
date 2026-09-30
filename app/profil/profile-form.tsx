"use client";

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { isValidIndonesianPhone } from "@/lib/validation";
import { Toast } from "@/components/toast";
import { KECAMATAN_SURABAYA } from "@/lib/districts";
import type { Campus, District, UserWithKampus } from "@/lib/types/database";

const MapPickerModal = dynamic(
  () => import("@/components/map-picker-modal").then((mod) => mod.MapPickerModal),
  { ssr: false }
);

export function ProfileForm({
  user,
  districts,
  campuses,
}: {
  user: UserWithKampus;
  districts?: District[];
  campuses?: Campus[];
}) {
  const [namaLengkap, setNamaLengkap] = useState(user.nama_lengkap);
  const [noHp, setNoHp] = useState(user.no_hp);
  const [districtId, setDistrictId] = useState(
    String(user.kecamatan_id ?? user.kampus_id ?? "")
  );
  const [alamatKos, setAlamatKos] = useState(user.alamat_kos ?? "");
  const [lat, setLat] = useState<number | null>(user.lat);
  const [lng, setLng] = useState<number | null>(user.lng);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const districtList: { id: string | number; nama_kecamatan: string }[] =
    districts && districts.length > 0
      ? districts
      : campuses && campuses.length > 0
      ? campuses.map((c) => ({ id: c.id, nama_kecamatan: c.nama_kampus }))
      : KECAMATAN_SURABAYA.map((d) => ({ id: d.id, nama_kecamatan: d.nama_kecamatan }));

  const [errors, setErrors] = useState<{ namaLengkap?: string; noHp?: string }>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function reverseGeocode(latitude: number, longitude: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "Accept-Language": "id,en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setAlamatKos(data.display_name);

          if (data.address) {
            const rawDistrict = (
              data.address.suburb ||
              data.address.city_district ||
              data.address.town ||
              ""
            ).toLowerCase();
            if (rawDistrict) {
              const matched = districtList.find((d) =>
                rawDistrict.includes(d.nama_kecamatan.toLowerCase()) ||
                d.nama_kecamatan.toLowerCase().includes(rawDistrict)
              );
              if (matched) {
                setDistrictId(String(matched.id));
              }
            }
          }
        }
      }
    } catch {
      // Ignore geocode error
    }
  }

  function handleAmbilLokasi() {
    if (!navigator.geolocation) {
      setLocationError("Browser ini tidak mendukung geolocation.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLng(longitude);
        await reverseGeocode(latitude, longitude);
        setLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser."
            : "Gagal mengambil lokasi GPS. Coba lagi atau pilih manual dari Peta."
        );
        setLocating(false);
      }
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: { namaLengkap?: string; noHp?: string } = {};
    if (!namaLengkap.trim()) {
      nextErrors.namaLengkap = "Nama lengkap wajib diisi.";
    }
    if (!noHp.trim()) {
      nextErrors.noHp = "No. HP wajib diisi.";
    } else if (!isValidIndonesianPhone(noHp)) {
      nextErrors.noHp = "Format no. HP tidak valid (contoh: 08xxxxxxxxxx atau +62xxxxxxxxxx).";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const parsedDistrictId = Number(districtId);
    const { error } = await supabase
      .from("users")
      .update({
        nama_lengkap: namaLengkap.trim(),
        no_hp: noHp.trim(),
        kecamatan_id: isNaN(parsedDistrictId) ? null : parsedDistrictId,
        alamat_kos: alamatKos.trim() || null,
        lat,
        lng,
      })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      setErrors({ noHp: error.message });
      return;
    }

    setToast("Data profil Anda berhasil disimpan!");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Lengkap */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nama_lengkap" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="nama_lengkap"
              type="text"
              placeholder="Contoh: Budi Santoso"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="h-10.5 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3.5 text-xs text-zinc-950 shadow-2xs outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 transition-all"
            />
            <svg className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {errors.namaLengkap && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.namaLengkap}</p>
          )}
        </div>

        {/* No HP */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="no_hp" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            No. HP (WhatsApp Aktif) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="no_hp"
              type="tel"
              placeholder="081234567890"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              className="h-10.5 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3.5 text-xs font-mono text-zinc-950 shadow-2xs outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 transition-all"
            />
            <svg className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          {errors.noHp && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.noHp}</p>}
        </div>

        {/* Kecamatan */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kecamatan_id" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Kecamatan Domisili (Surabaya) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="kecamatan_id"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="h-10.5 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-8 text-xs font-medium text-zinc-950 shadow-2xs outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 transition-all"
            >
              <option value="" disabled>
                -- Pilih Kecamatan di Surabaya --
              </option>
              {districtList.map((district) => (
                <option key={district.id} value={district.id}>
                  Kec. {district.nama_kecamatan}
                </option>
              ))}
            </select>
            <svg className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Unified Alamat Detail & Lokasi GPS Card */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label htmlFor="alamat_kos" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Alamat Detail &amp; Pin Lokasi GPS
            </label>
            {lat !== null && lng !== null ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-300 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                ✓ GPS Tersimpan
              </span>
            ) : (
              <span className="text-[11px] text-zinc-400 italic">Belum diatur</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              suppressHydrationWarning
              type="button"
              onClick={handleAmbilLokasi}
              disabled={locating}
              className="h-9 flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <svg className={`h-3.5 w-3.5 text-zinc-500 ${locating ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
              </svg>
              {locating ? "Deteksi GPS & Alamat..." : "Deteksi Otomatis GPS (Isi Alamat)"}
            </button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setMapModalOpen(true)}
              className="h-9 flex items-center justify-center gap-1.5 px-3.5 rounded-lg bg-zinc-900 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shrink-0 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.818V8.045a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Pilih di Peta</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              id="alamat_kos"
              rows={3}
              placeholder="Contoh: Jl. Keputih Tegal No. 42 (Dekat Kantin Utama)"
              value={alamatKos}
              onChange={(e) => setAlamatKos(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs text-zinc-950 shadow-2xs outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 transition-all"
            />
          </div>

          {lat !== null && lng !== null && (
            <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
            </p>
          )}
          {locationError && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{locationError}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            suppressHydrationWarning
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-zinc-950 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan Profil"
            )}
          </button>
        </div>

        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </form>

      <MapPickerModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        initialLat={lat}
        initialLng={lng}
        onSelectLocation={async (newLat, newLng, addressText) => {
          setLat(newLat);
          setLng(newLng);
          setLocationError(null);
          if (addressText) {
            setAlamatKos(addressText);
          } else {
            await reverseGeocode(newLat, newLng);
          }
        }}
      />
    </>
  );
}
