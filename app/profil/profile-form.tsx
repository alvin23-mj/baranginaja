"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { isValidIndonesianPhone } from "@/lib/validation";
import { Toast } from "@/components/toast";
import { KECAMATAN_SURABAYA } from "@/lib/districts";
import type { Campus, District, UserWithKampus } from "@/lib/types/database";

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

  const districtList: { id: string | number; nama_kecamatan: string }[] =
    districts && districts.length > 0
      ? districts
      : campuses && campuses.length > 0
      ? campuses.map((c) => ({ id: c.id, nama_kecamatan: c.nama_kampus }))
      : KECAMATAN_SURABAYA.map((d) => ({ id: d.id, nama_kecamatan: d.nama_kecamatan }));

  const [errors, setErrors] = useState<{ namaLengkap?: string; noHp?: string }>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleAmbilLokasi() {
    if (!navigator.geolocation) {
      setLocationError("Browser ini tidak mendukung geolocation.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan izin lokasi di browser."
            : "Gagal mengambil lokasi. Coba lagi."
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

    setToast("Profil berhasil diperbarui.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nama_lengkap" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Nama lengkap
        </label>
        <input
          id="nama_lengkap"
          type="text"
          value={namaLengkap}
          onChange={(e) => setNamaLengkap(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
        {errors.namaLengkap && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.namaLengkap}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="no_hp" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          No. HP
        </label>
        <input
          id="no_hp"
          type="tel"
          value={noHp}
          onChange={(e) => setNoHp(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
        {errors.noHp && <p className="text-xs text-red-600 dark:text-red-400">{errors.noHp}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="kecamatan_id" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Kecamatan Domisili (Surabaya)
        </label>
        <select
          id="kecamatan_id"
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        >
          <option value="" disabled>
            Pilih Kecamatan di Surabaya
          </option>
          {districtList.map((district) => (
            <option key={district.id} value={district.id}>
              Kec. {district.nama_kecamatan}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="alamat_kos" className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Alamat Lengkap / Kos
        </label>
        <textarea
          id="alamat_kos"
          rows={3}
          placeholder="Jl. Contoh No. 123, RT/RW..."
          value={alamatKos}
          onChange={(e) => setAlamatKos(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Lokasi</span>
        <button
          type="button"
          onClick={handleAmbilLokasi}
          disabled={locating}
          className="h-10 w-full rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {locating ? "Mengambil lokasi..." : "Ambil Lokasi Saya"}
        </button>
        {lat !== null && lng !== null && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Koordinat: {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        )}
        {locationError && (
          <p className="text-xs text-red-600 dark:text-red-400">{locationError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 h-11 w-full rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </form>
  );
}
