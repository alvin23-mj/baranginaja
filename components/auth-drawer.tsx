"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { KECAMATAN_SURABAYA } from "@/lib/districts";

export interface DistrictItem {
  id: string | number;
  nama_kecamatan: string;
}

export type CampusItem = DistrictItem;

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  districts?: DistrictItem[];
  campuses?: DistrictItem[];
}

export function AuthDrawer({
  isOpen,
  onClose,
  initialMode = "login",
  districts,
  campuses,
}: AuthDrawerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form states - Register
  const [regNama, setRegNama] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regNoHp, setRegNoHp] = useState("");
  const [regDistrictId, setRegDistrictId] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // District list with static 31 Surabaya districts fallback
  const initialDistricts = districts || campuses || KECAMATAN_SURABAYA.map((d) => ({
    id: d.id,
    nama_kecamatan: d.nama_kecamatan,
  }));
  const [districtList, setDistrictList] = useState<DistrictItem[]>(initialDistricts);

  // Sync mode with initialMode when drawer opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLoginError(null);
      setRegError(null);
      setRegSuccess(null);
    }
  }, [isOpen, initialMode]);

  // Fetch districts from database if available
  useEffect(() => {
    async function loadDistricts() {
      const supabase = createClient();
      try {
        const { data } = await supabase
          .from("districts")
          .select("id, nama_kecamatan")
          .eq("aktif", true)
          .order("nama_kecamatan", { ascending: true });
        if (data && data.length > 0) {
          setDistrictList(data);
        }
      } catch {
        // Fallback already populated
      }
    }
    loadDistricts();
  }, []);

  // Lock body scroll when open & handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  // Handle Login Submit
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

    // Check if user is admin
    let isAdmin = false;
    if (authData?.user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      isAdmin = profile?.role === "admin";
    }

    setLoginLoading(false);
    onClose();

    if (isAdmin) {
      router.push("/admin");
    } else {
      router.refresh();
    }
  }

  // Handle Register Submit
  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regDistrictId) {
      setRegError("Silakan pilih kecamatan Anda di Surabaya terlebih dahulu.");
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

    const parsedDistrictId = Number(regDistrictId);
    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      nama_lengkap: regNama,
      email: regEmail,
      no_hp: regNoHp,
      kecamatan_id: isNaN(parsedDistrictId) ? null : parsedDistrictId,
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
    setMode("login");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Sheet (muncul dari kanan seperti cart checkout) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white text-zinc-900 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out dark:bg-zinc-900 dark:text-zinc-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-drawer-title"
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Bag BA Icon */}
            <div className="h-8 w-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-black text-xs">
              BA
            </div>
            <div>
              <h2 id="auth-drawer-title" className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                {mode === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Marketplace Jual Beli 31 Kecamatan Surabaya
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Tutup panel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher: Masuk | Daftar */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setLoginError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setRegError(null);
                setRegSuccess(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Daftar
            </button>
          </div>
        </div>

        {/* Form Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {regSuccess && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
              {regSuccess}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: FORM LOGIN                                                 */}
          {/* ================================================================= */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {loginError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
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
                  placeholder="nama@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="Minimal 6 karakter"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 pr-10 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100"
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
                className="mt-2 h-11 w-full rounded-lg bg-zinc-950 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-xs"
              >
                {loginLoading ? "Memproses Masuk..." : "Masuk"}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setLoginError(null);
                    }}
                    className="font-semibold text-zinc-900 underline hover:text-blue-600 dark:text-white cursor-pointer"
                  >
                    Daftar di sini
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* TAB 2: FORM REGISTER                                              */}
          {/* ================================================================= */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
              {regError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
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
                  placeholder="Contoh: Budi Santoso"
                  value={regNama}
                  onChange={(e) => setRegNama(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100"
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
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100"
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
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 pr-10 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100"
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
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Kecamatan Domisili (Surabaya)
                </label>
                <select
                  required
                  value={regDistrictId}
                  onChange={(e) => setRegDistrictId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-100"
                >
                  <option value="" disabled>
                    -- Pilih Kecamatan di Surabaya --
                  </option>
                  {districtList.map((d) => (
                    <option key={d.id} value={d.id}>
                      Kec. {d.nama_kecamatan}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="mt-2 h-11 w-full rounded-lg bg-zinc-950 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-xs"
              >
                {regLoading ? "Mendaftarkan Akun..." : "Daftar Akun"}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setRegError(null);
                    }}
                    className="font-semibold text-zinc-900 underline hover:text-blue-600 dark:text-white cursor-pointer"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
