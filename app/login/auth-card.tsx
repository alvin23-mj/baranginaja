"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { District } from "@/lib/types/database";

interface AuthCardProps {
  districts: District[];
}

export function AuthCard({ districts }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab =
    searchParams.get("tab") === "register" || searchParams.get("mode") === "register"
      ? "register"
      : "login";

  const [tab, setTab] = useState<"login" | "register">(initialTab);

  // Google OAuth state
  const [googleLoading, setGoogleLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(
    searchParams.get("error") === "auth-code-error"
      ? "Gagal masuk dengan Google. Silakan coba lagi."
      : null
  );

  // Register form state
  const [regNama, setRegNama] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regNoHp, setRegNoHp] = useState("");
  const [regKecamatanId, setRegKecamatanId] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(
    searchParams.get("registered") === "1"
      ? "Akun berhasil dibuat. Silakan masuk."
      : null
  );

  // Searchable Kecamatan state
  const [districtSearch, setDistrictSearch] = useState("");
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const districtDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        districtDropdownRef.current &&
        !districtDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDistrictOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDistricts = districts.filter((d) =>
    d.nama_kecamatan.toLowerCase().includes(districtSearch.toLowerCase().trim())
  );

  async function handleGoogleSignIn() {
    setLoginError(null);
    setRegError(null);
    setGoogleLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (tab === "login") {
        setLoginError(error.message);
      } else {
        setRegError(error.message);
      }
      setGoogleLoading(false);
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
      setLoginLoading(false);
      return;
    }

    let isAdmin = false;
    if (authData?.user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      isAdmin = profile?.role === "admin";
    }

    const redirectTo = searchParams.get("redirectTo");
    setLoginLoading(false);

    if (isAdmin) {
      if (redirectTo && redirectTo.startsWith("/admin")) {
        router.push(redirectTo);
      } else {
        router.push("/admin");
      }
    } else {
      router.push(redirectTo || "/");
    }
    router.refresh();
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regKecamatanId) {
      setRegError("Silakan pilih kecamatan domisili Anda di Surabaya terlebih dahulu.");
      return;
    }

    setRegLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
    });

    if (signUpError) {
      setRegError(signUpError.message);
      setRegLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setRegError("Gagal membuat akun. Silakan coba lagi.");
      setRegLoading(false);
      return;
    }

    const parsedKecamatanId = Number(regKecamatanId);
    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      nama_lengkap: regNama,
      email: regEmail,
      no_hp: regNoHp,
      kecamatan_id: isNaN(parsedKecamatanId) ? null : parsedKecamatanId,
      status_verifikasi: "pending",
      role: "buyer",
      is_seller: false,
    });

    if (insertError) {
      setRegError(insertError.message);
      setRegLoading(false);
      return;
    }

    setRegLoading(false);
    setRegSuccess("Akun berhasil dibuat! Silakan masuk menggunakan akun baru Anda.");
    setLoginEmail(regEmail);
    setLoginPassword(regPassword);
    setTab("login");
  }

  return (
    <div className="w-full max-w-md">
      {/* Container Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header Branding - lowercase baranginaja */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link
            href="/"
            title="Kembali ke Beranda"
            className="inline-flex items-center gap-1.5 group transition-opacity hover:opacity-80"
          >
            <span className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              barangin<span className="text-amber-700">aja</span>
            </span>
          </Link>
        </div>

        {/* Success Banner */}
        {regSuccess && (
          <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            {regSuccess}
          </div>
        )}

        {/* FORM MASUK */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {loginError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
                {loginError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="nama@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  placeholder="Minimal 6 karakter"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 pr-10 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  aria-label="Lihat kata sandi"
                >
                  {showLoginPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-1 h-11 w-full rounded-lg bg-[#111111] text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm"
            >
              {loginLoading ? "Memproses Masuk..." : "Masuk"}
            </button>

            {/* Divider "atau" */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500 font-medium">
                  atau
                </span>
              </div>
            </div>

            {/* Tombol Masuk dengan Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 cursor-pointer dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 shadow-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? "Menghubungkan..." : "Masuk dengan Google"}</span>
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setLoginError(null);
                  }}
                  className="font-semibold text-zinc-900 underline hover:text-amber-700 dark:text-white cursor-pointer"
                >
                  Daftar di sini
                </button>
              </p>
            </div>
          </form>
        )}

        {/* FORM DAFTAR */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            {regError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
                {regError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Contoh: Budi Santoso"
                value={regNama}
                onChange={(e) => setRegNama(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3.5 pr-10 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  aria-label="Lihat kata sandi"
                >
                  {showRegPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nomor WhatsApp / HP
              </label>
              <input
                type="tel"
                required
                placeholder="08123456789"
                value={regNoHp}
                onChange={(e) => setRegNoHp(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
              />
            </div>

            <div className="flex flex-col gap-1.5" ref={districtDropdownRef}>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Kecamatan Domisili (Kota Surabaya)
              </label>
              <div className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required={!regKecamatanId}
                    placeholder="Cari kecamatan (cth: Wonokromo)..."
                    value={districtSearch}
                    onFocus={() => setIsDistrictOpen(true)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDistrictSearch(val);
                      setIsDistrictOpen(true);
                      const exact = districts.find(
                        (d) => d.nama_kecamatan.toLowerCase() === val.toLowerCase().trim()
                      );
                      if (exact) {
                        setRegKecamatanId(String(exact.id));
                      } else {
                        setRegKecamatanId("");
                      }
                    }}
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-3.5 pr-14 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
                  />
                  <div className="absolute right-2 flex items-center gap-1 text-zinc-400">
                    {districtSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setDistrictSearch("");
                          setRegKecamatanId("");
                          setIsDistrictOpen(true);
                        }}
                        className="p-1 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        aria-label="Hapus teks pencarian"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsDistrictOpen(!isDistrictOpen)}
                      className="p-1 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      aria-label="Buka pilihan kecamatan"
                    >
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${isDistrictOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Dropdown Menu Otomatis Saat Mengetik */}
                {isDistrictOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-52 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                    {filteredDistricts.length > 0 ? (
                      filteredDistricts.map((d) => {
                        const isSelected = String(d.id) === regKecamatanId;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setRegKecamatanId(String(d.id));
                              setDistrictSearch(d.nama_kecamatan);
                              setIsDistrictOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-amber-50 text-amber-900 font-semibold dark:bg-amber-950/40 dark:text-amber-300"
                                : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <span>Kec. {d.nama_kecamatan}</span>
                            {isSelected && (
                              <svg className="h-4 w-4 text-amber-700 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-3 text-center text-xs text-zinc-400">
                        Kecamatan &ldquo;{districtSearch}&rdquo; tidak ditemukan di Surabaya
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="mt-1 h-11 w-full rounded-lg bg-[#111111] text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm"
            >
              {regLoading ? "Mendaftarkan Akun..." : "Daftar Akun"}
            </button>

            {/* Divider "atau" */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500 font-medium">
                  atau
                </span>
              </div>
            </div>

            {/* Tombol Daftar dengan Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 cursor-pointer dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 shadow-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? "Menghubungkan..." : "Daftar dengan Google"}</span>
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setRegError(null);
                  }}
                  className="font-semibold text-zinc-900 underline hover:text-amber-700 dark:text-white cursor-pointer"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
