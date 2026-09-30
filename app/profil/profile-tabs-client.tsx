"use client";

import { useState } from "react";
import Link from "next/link";
import type { Campus, District, UserWithKampus } from "@/lib/types/database";
import { ProfileForm } from "./profile-form";
import { SellerSection } from "./seller-section";

interface ProfileTabsClientProps {
  user: UserWithKampus;
  districts: District[];
  campuses?: Campus[];
  productCount: number;
  districtName: string;
}

export function ProfileTabsClient({
  user,
  districts,
  campuses,
  productCount,
  districtName,
}: ProfileTabsClientProps) {
  const [activeTab, setActiveTab] = useState<"profil" | "penjual" | "keamanan">("profil");

  // Generate initials e.g. Budi Santoso -> BS
  const initials = user.nama_lengkap
    ? user.nama_lengkap
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HERO PROFILE BANNER CARD (BLACK BACKGROUND WITH CUT-OFF WATERMARK)    */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#141416] p-6 sm:p-8 text-white shadow-xl">
        {/* Watermark Logo BaranginAja (Diturunkan Kebawah & Digeser Kanan ke Pinggir Card) */}
        <div
          aria-hidden="true"
          className="absolute -bottom-3 right-1 sm:-bottom-4 sm:right-2 lg:-bottom-5 lg:right-3 select-none pointer-events-none z-0"
        >
          <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[96px] font-black tracking-tighter leading-none text-zinc-700/20">
            barangin<span className="text-zinc-600/25">aja</span>
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Subtitle Accent Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
              AKUN RESMI KAMPUS &amp; WARGA SURABAYA
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                user.status_verifikasi === "verified"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : user.status_verifikasi === "pending"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${user.status_verifikasi === "verified" ? "bg-emerald-400" : user.status_verifikasi === "pending" ? "bg-amber-400 animate-pulse" : "bg-rose-400"}`} />
              Status: {user.status_verifikasi === "verified" ? "Terverifikasi" : user.status_verifikasi === "pending" ? "Menunggu Verifikasi" : "Ditolak"}
            </span>
          </div>

          {/* User Main Info & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar Circle */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-950 font-black text-2xl text-white shadow-xl border-2 border-zinc-700">
                {initials}
                {user.status_verifikasi === "verified" && (
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md border-2 border-[#141416] text-xs" title="Terverifikasi">
                    ✓
                  </span>
                )}
              </div>

              {/* User Info */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {user.nama_lengkap}
                  </h1>
                  {user.role === "admin" && (
                    <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-xs font-bold text-purple-300">
                      👑 Admin
                    </span>
                  )}
                  {user.is_seller && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                      Penjual Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-mono">{user.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/pesanan-saya"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
              >
                Pesanan Saya
              </Link>
              {user.is_seller ? (
                <Link
                  href="/jual"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-white px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  + Jual Barang
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("penjual")}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-white px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  Daftar Akun Penjual
                </button>
              )}
            </div>
          </div>

          {/* Quick Info Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <span className="text-[11px] font-medium text-zinc-400 block">Kecamatan Domisili</span>
              <span className="font-semibold text-white truncate block mt-0.5">
                {districtName !== "-" ? `Kec. ${districtName}` : "Belum Diatur"}
              </span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <span className="text-[11px] font-medium text-zinc-400 block">Produk Dagangan Saya</span>
              <span className="font-bold text-emerald-400 mt-0.5 block">
                {productCount} Barang Katalog
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <span className="text-[11px] font-medium text-zinc-400 block">Nomor Kontak WhatsApp</span>
              <span className="font-mono font-semibold text-white mt-0.5 block">
                {user.no_hp || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABBED NAVIGATION BAR                                                 */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("profil")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "profil"
              ? "border-zinc-950 text-zinc-950 dark:border-white dark:text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Data Diri &amp; Lokasi
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("penjual")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "penjual"
              ? "border-zinc-950 text-zinc-950 dark:border-white dark:text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Fitur &amp; Rekening Penjual
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("keamanan")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "keamanan"
              ? "border-zinc-950 text-zinc-950 dark:border-white dark:text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Ringkasan Akses &amp; Bantuan
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT VIEWS                                                     */}
      {/* ========================================================================= */}
      {activeTab === "profil" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              Edit Data Diri &amp; Domisili
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Perbarui nama lengkap, nomor telepon WhatsApp, lokasi kecamatan, dan titik pin lokasi Anda.
            </p>
          </div>

          <ProfileForm user={user} districts={districts} campuses={campuses} />
        </div>
      )}

      {activeTab === "penjual" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <SellerSection user={user} />
        </div>
      )}

      {activeTab === "keamanan" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Card Status Keamanan Akun */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Status Otorisasi &amp; Akses Akun
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50 space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Role Hak Akses System</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">
                  {user.role}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {user.role === "admin" ? "Akses penuh ke dashboard manajemen admin" : "Pengguna terdaftar platform BaranginAja"}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50 space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Status Verifikasi Kampus</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">
                  {user.status_verifikasi}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Status verifikasi identitas domisili &amp; mahasiswa Surabaya
                </p>
              </div>
            </div>

            {/* Quick Links Menu */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Pintasan Menu Pengguna
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link
                  href="/pesanan-saya"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Lihat Pesanan Saya
                </Link>

                {user.is_seller && (
                  <Link
                    href="/jual"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Jual Barang Baru
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300 bg-purple-50 px-3.5 py-2 font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    👑 Buka Dashboard Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
