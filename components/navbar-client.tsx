"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import type { DistrictItem, CampusItem } from "./auth-drawer";

interface CategoryItem {
  id: string;
  nama_kategori: string;
}

interface NavbarClientProps {
  user: { id: string; email?: string; name?: string | null } | null;
  isAdmin: boolean;
  isSeller: boolean;
  districtName?: string | null;
  campusName?: string | null;
  categories?: CategoryItem[];
  districts?: DistrictItem[];
  campuses?: CampusItem[];
}

export function NavbarClient({
  user,
  isAdmin,
  isSeller,
  districtName,
  campusName,
  districts = [],
  campuses = [],
}: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Dropdown & modal states (activeDropdown is mutually exclusive: "user" | "help" | null)
  const [activeDropdown, setActiveDropdown] = useState<"user" | "help" | null>(null);
  const [lockedDropdown, setLockedDropdown] = useState<"user" | "help" | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [sellerPromptOpen, setSellerPromptOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [ratingTags, setRatingTags] = useState<string[]>([]);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userToggleRef = useRef<HTMLButtonElement>(null);
  const helpToggleRef = useRef<HTMLButtonElement>(null);

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearDropdownTimeout = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  const closeDropdowns = () => {
    clearDropdownTimeout();
    setActiveDropdown(null);
    setLockedDropdown(null);
  };

  // User menu handlers
  const handleUserMouseEnter = () => {
    clearDropdownTimeout();
    setActiveDropdown("user");
  };

  const handleUserMouseLeave = () => {
    if (lockedDropdown !== "user") {
      dropdownTimeoutRef.current = setTimeout(() => {
        setActiveDropdown((prev) => (prev === "user" ? null : prev));
      }, 180);
    }
  };

  const handleUserClick = () => {
    clearDropdownTimeout();
    if (activeDropdown === "user" && lockedDropdown === "user") {
      closeDropdowns();
    } else {
      setActiveDropdown("user");
      setLockedDropdown("user");
    }
  };

  // Help menu handlers
  const handleHelpMouseEnter = () => {
    clearDropdownTimeout();
    setActiveDropdown("help");
  };

  const handleHelpMouseLeave = () => {
    if (lockedDropdown !== "help") {
      dropdownTimeoutRef.current = setTimeout(() => {
        setActiveDropdown((prev) => (prev === "help" ? null : prev));
      }, 180);
    }
  };

  const handleHelpClick = () => {
    clearDropdownTimeout();
    if (activeDropdown === "help" && lockedDropdown === "help") {
      closeDropdowns();
    } else {
      setActiveDropdown("help");
      setLockedDropdown("help");
    }
  };

  // Dropdown bar mouse handlers
  const handleDropdownBarMouseEnter = () => {
    clearDropdownTimeout();
  };

  const handleDropdownBarMouseLeave = () => {
    if (!lockedDropdown) {
      dropdownTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
      }, 180);
    }
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const handleDirectLogout = async () => {
    setLogoutLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    closeDropdowns();
    setLogoutLoading(false);
    router.push("/login");
    router.refresh();
  };

  // Close user / help dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideUserToggle = userToggleRef.current?.contains(target);
      const isInsideHelpToggle = helpToggleRef.current?.contains(target);
      const isInsideDropdown = userDropdownRef.current?.contains(target);

      if (!isInsideUserToggle && !isInsideHelpToggle && !isInsideDropdown) {
        closeDropdowns();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close all menus on route change
  useEffect(() => {
    closeDropdowns();
    setMobileMenuOpen(false);
    setSellerPromptOpen(false);
    setShippingModalOpen(false);
  }, [pathname]);

  const handleStoreClick = () => {
    if (!user) {
      router.push("/login?redirectTo=/jual");
      return;
    }
    if (!isSeller) {
      setSellerPromptOpen(true);
      return;
    }
    router.push("/jual");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinkClass = (href: string) =>
    `text-sm lg:text-[15px] transition-colors duration-150 ${
      isActive(href)
        ? "text-white font-semibold"
        : "text-zinc-300 hover:text-white font-medium"
    }`;

  const mobileNavLinkClass = (href: string) =>
    `block px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
      isActive(href)
        ? "bg-zinc-800 text-white font-semibold"
        : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
    }`;

  // Admin routes and auth pages use their own clean layout without main navbar
  if (pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#111111] border-b border-zinc-800/80 shadow-md">
      <div className="container mx-auto relative flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* KIRI: Logo baranginaja (tulisan kecil semua)                              */}
        {/* ========================================================================= */}
        <div className="flex items-center shrink-0 z-10">
          <Link
            href="/"
            className="flex items-center group transition-opacity hover:opacity-90"
            aria-label="baranginaja"
          >
            <span className="text-xl sm:text-[22px] font-bold tracking-tight text-white select-none">
              barangin<span className="text-amber-700">aja</span>
            </span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* TENGAH: Menu Navigasi (Beranda, Katalog, Tentang Kami, Bantuan)            */}
        {/* ========================================================================= */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12 absolute left-1/2 -translate-x-1/2">
          <Link href="/" className={navLinkClass("/")}>
            Beranda
          </Link>
          <Link href="/produk" className={navLinkClass("/produk")}>
            Katalog
          </Link>
          <Link href="/tentang-kami" className={navLinkClass("/tentang-kami")}>
            Tentang Kami
          </Link>
          <button
            ref={helpToggleRef}
            type="button"
            onMouseEnter={handleHelpMouseEnter}
            onMouseLeave={handleHelpMouseLeave}
            onClick={handleHelpClick}
            className={`inline-flex items-center gap-2 text-sm lg:text-[15px] font-medium transition-colors duration-150 cursor-pointer ${
              activeDropdown === "help" || isActive("/bantuan")
                ? "text-white"
                : "text-zinc-300 hover:text-white"
            }`}
            aria-label="Menu Bantuan"
          >
            <span>Bantuan</span>
            <svg
              className={`h-3.5 w-3.5 transition-colors duration-150 ${
                activeDropdown === "help" ? "text-white" : "text-zinc-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 9 5-5 5 5" />
              <path d="m7 15 5 5 5-5" />
            </svg>
          </button>
        </nav>

        {/* ========================================================================= */}
        {/* KANAN: Ikon Toko (Kelola Toko), Masuk / Profil, Tombol Jual Barang        */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-4 sm:gap-5 shrink-0 z-10">
          {/* Ikon Toko / Kelola Toko */}
          <button
            type="button"
            onClick={handleStoreClick}
            className="text-zinc-300 hover:text-white transition-colors p-1 cursor-pointer flex items-center justify-center"
            title="Kelola Toko"
            aria-label="Kelola Toko"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
              <path d="M2 7h20" />
              <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
            </svg>
          </button>

          {/* Masuk / Menu Pengguna */}
          {user ? (
            <button
              ref={userToggleRef}
              type="button"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
              onClick={handleUserClick}
              className={`inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-150 cursor-pointer py-1.5 ${
                activeDropdown === "user"
                  ? "text-white"
                  : "text-zinc-300 hover:text-white"
              }`}
              aria-label="Menu Pengguna"
            >
              <span className="truncate max-w-[100px] sm:max-w-[130px]">
                {user.name ? user.name.split(" ")[0] : "Akun"}
              </span>
              <svg
                className={`h-3.5 w-3.5 transition-colors duration-150 ${
                  activeDropdown === "user" ? "text-white" : "text-zinc-400"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 9 5-5 5 5" />
                <path d="m7 15 5 5 5-5" />
              </svg>
            </button>
          ) : (
            <Link
              href="/login"
              className="text-zinc-300 hover:text-white text-sm font-medium transition-colors px-3 py-2 cursor-pointer"
            >
              Masuk
            </Link>
          )}

          {/* Tombol Jual Barang (rounded-lg) */}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                router.push("/login?redirectTo=/jual/tambah");
                return;
              }
              if (!isSeller) {
                setSellerPromptOpen(true);
                return;
              }
              router.push("/jual/tambah");
            }}
            className="inline-flex items-center justify-center bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all duration-150 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm cursor-pointer"
          >
            Jual Barang
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:text-white md:hidden cursor-pointer"
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DROPDOWN BAR: PROFIL SAYA & KELUAR / BANTUAN                              */}
      {/* ========================================================================= */}
      <div
        ref={userDropdownRef}
        onMouseEnter={handleDropdownBarMouseEnter}
        onMouseLeave={handleDropdownBarMouseLeave}
        className={`w-full overflow-hidden transition-all duration-300 ease-in-out bg-[#111111] ${
          (activeDropdown === "help") || (activeDropdown === "user" && user)
            ? "max-h-64 opacity-100 pt-6 pb-5 sm:pt-7 sm:pb-6"
            : "max-h-0 opacity-0 pt-0 pb-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* 1. Dropdown Pengguna: Profil Saya & Keluar (2 Kolom) */}
          {user && activeDropdown === "user" && (
            <div className="grid grid-cols-2 divide-x divide-zinc-800/80 w-full animate-in fade-in duration-150">
              {/* Kolom 1: Profil Saya */}
              <div className="py-2 pr-4 sm:pr-6 flex items-center">
                <Link
                  href="/profil"
                  onClick={closeDropdowns}
                  className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer"
                >
                  <svg
                    className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Profil Saya</span>
                </Link>
              </div>

              {/* Kolom 2: Keluar */}
              <div className="py-2 px-4 sm:px-6 flex items-center">
                <button
                  type="button"
                  onClick={handleDirectLogout}
                  disabled={logoutLoading}
                  className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-red-400 transition-colors duration-150 cursor-pointer text-left"
                >
                  <svg
                    className="h-4 w-4 text-zinc-400 group-hover:text-red-400 transition-colors shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>{logoutLoading ? "Memproses Keluar..." : "Keluar"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Dropdown Bantuan: 4 Kolom Tombol dengan Ikon & Judul Kolom */}
          {activeDropdown === "help" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-800/80 w-full animate-in fade-in duration-150">
              {/* Kolom 1: Panduan Transaksi (Cara Membeli & Cara Menjual) */}
              <div className="py-2 pr-4 sm:pr-6 flex flex-col items-start gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Panduan Transaksi
                </span>
                <div className="flex flex-col items-start gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setHelpModalOpen(true);
                      closeDropdowns();
                    }}
                    className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer text-left"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span>Cara Membeli</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        router.push("/login?redirectTo=/jual/tambah");
                      } else if (!isSeller) {
                        setSellerPromptOpen(true);
                      } else {
                        router.push("/jual/tambah");
                      }
                      closeDropdowns();
                    }}
                    className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer text-left"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                      <circle cx="7" cy="7" r="1" fill="currentColor" />
                    </svg>
                    <span>Cara Menjual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        router.push("/login?redirectTo=/profil");
                      } else if (!isSeller) {
                        setSellerPromptOpen(true);
                      } else {
                        router.push("/jual");
                      }
                      closeDropdowns();
                    }}
                    className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer text-left"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" x2="19" y1="8" y2="14" />
                      <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                    <span>Daftar Jadi Penjual</span>
                  </button>
                </div>
              </div>

              {/* Kolom 2: Pengiriman & Keamanan */}
              <div className="py-2 px-4 sm:px-6 flex flex-col items-start gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Pengiriman & Keamanan
                </span>
                <div className="flex flex-col items-start gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setShippingModalOpen(true);
                      closeDropdowns();
                    }}
                    className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer text-left"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                      <path d="M15 18H9" />
                      <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10Z" />
                      <circle cx="7" cy="18" r="2" />
                      <circle cx="17" cy="18" r="2" />
                    </svg>
                    <span>Tarif & Ongkir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHelpModalOpen(true);
                      closeDropdowns();
                    }}
                    className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer text-left"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>Keamanan & COD</span>
                  </button>
                </div>
              </div>

              {/* Kolom 3: Layanan Bantuan */}
              <div className="py-2 px-4 sm:px-6 flex flex-col items-start gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Layanan Bantuan
                </span>
                <div className="flex flex-col items-start gap-2 w-full">
                  <Link
                    href="/bantuan"
                    onClick={closeDropdowns}
                    className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.5} />
                    </svg>
                    <span>Pusat Bantuan</span>
                  </Link>

                  <Link
                    href="/faq"
                    onClick={closeDropdowns}
                    className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M9 10h.01" />
                      <path d="M12 10h.01" />
                      <path d="M15 10h.01" />
                    </svg>
                    <span>Pertanyaan Umum (FAQ)</span>
                  </Link>
                </div>
              </div>

              {/* Kolom 4: Dukungan & Ulasan */}
              <div className="py-2 pl-4 sm:pl-6 flex flex-col items-start gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Dukungan & Ulasan
                </span>
                <div className="flex flex-col items-start gap-2 w-full">
                  <a
                    href="https://saweria.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeDropdowns}
                    className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <span>Beri Kami Semangat</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setRatingModalOpen(true);
                      closeDropdowns();
                    }}
                    className="group inline-flex items-center gap-2.5 py-1 text-[14px] sm:text-[15px] font-semibold text-zinc-300 hover:text-white transition-colors duration-150 cursor-pointer text-left"
                  >
                    <svg
                      className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>Rating Kepuasan Website</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER MENU                                                        */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 bg-[#141414] px-4 py-4 md:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {(districtName || campusName) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <span className="font-medium">
                  {districtName ? `Kec. ${districtName}, Surabaya` : campusName}
                </span>
              </div>
            )}

            <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Menu Utama
            </p>
            <Link href="/" className={mobileNavLinkClass("/")}>
              Beranda
            </Link>
            <Link href="/produk" className={mobileNavLinkClass("/produk")}>
              Katalog
            </Link>
            <Link href="/tentang-kami" className={mobileNavLinkClass("/tentang-kami")}>
              Tentang Kami
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setHelpModalOpen(true);
              }}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
            >
              Bantuan & Panduan
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShippingModalOpen(true);
              }}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
            >
              Tarif & Ongkir
            </button>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
            >
              Pertanyaan Umum (FAQ)
            </Link>
            <a
              href="https://saweria.co"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
            >
              Beri Kami Semangat
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setRatingModalOpen(true);
              }}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
            >
              Rating Kepuasan Website
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleStoreClick();
              }}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
            >
              Kelola Toko
            </button>

            {user && isSeller && (
              <>
                <p className="px-3 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Fitur Penjual
                </p>
                <Link href="/jual/tambah" className={mobileNavLinkClass("/jual/tambah")}>
                  Jual Barang Baru
                </Link>
                <Link href="/jual/pendapatan" className={mobileNavLinkClass("/jual/pendapatan")}>
                  Pendapatan
                </Link>
              </>
            )}

            {user && isAdmin && (
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="flex items-center justify-between rounded-lg bg-blue-950/60 border border-blue-800/60 px-3 py-2.5 text-sm font-semibold text-blue-300"
                >
                  <span>Buka Panel Admin</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            )}

            <div className="mt-3 border-t border-zinc-800 pt-3">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/profil"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-800"
                  >
                    Profil Saya ({user.name || user.email})
                  </Link>
                  <Link
                    href="/pesanan-saya"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-800"
                  >
                    Pesanan Saya
                  </Link>
                  <div className="px-1 pt-1">
                    <LogoutButton />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-center text-sm font-medium text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/login?tab=register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-lg bg-white text-zinc-950 py-2.5 text-center text-sm font-semibold hover:bg-zinc-200 cursor-pointer"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL BANTUAN                                                             */}
      {/* ========================================================================= */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161616] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-white font-bold text-sm">
                  ?
                </span>
                <h3 className="text-base font-bold text-white">
                  Pusat Bantuan BaranginAja
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
                aria-label="Tutup modal bantuan"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span>🛡️</span> Transaksi Mahasiswa Terverifikasi
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Semua penjual dan pembeli terdaftar dengan email kampus aktif demi kenyamanan dan keamanan transaksi.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span>🤝</span> COD di Lingkungan Kampus
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Bisa janjian bertemu langsung (COD) di perpustakaan, kantin, atau lobi fakultas tanpa biaya admin.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span>💬</span> Ada Kendala?
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Hubungi admin kampus atau buka halaman detail pesanan untuk melihat kontak penjual.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Link
                href="/bantuan"
                onClick={() => setHelpModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-white hover:underline"
              >
                Lihat Semua FAQ &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KETENTUAN TARIF & ONGKOS KIRIM                                      */}
      {/* ========================================================================= */}
      {shippingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#161616] p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-white font-bold text-sm">
                  🚚
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Ketentuan Tarif & Ongkos Kirim
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Transparan, terjangkau, dan dihitung otomatis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShippingModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
                aria-label="Tutup modal tarif ongkir"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm text-zinc-300">
              {/* 2 Card tarif dasar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Tarif Jarak
                  </span>
                  <p className="text-xl font-bold text-white mt-1">
                    Rp 2.500 <span className="text-xs font-normal text-zinc-400">/ km</span>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Dihitung dari rute jarak titik lokasi penjual ke pembeli.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Tarif Berat
                  </span>
                  <p className="text-xl font-bold text-white mt-1">
                    Rp 5.000 <span className="text-xs font-normal text-zinc-400">/ kg</span>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Dihitung berdasarkan berat barang pesanan per kilogram.
                  </p>
                </div>
              </div>

              {/* Rumus perhitungan */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 space-y-1.5">
                <p className="font-semibold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>📐</span> Rumus Perhitungan Kurir
                </p>
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-zinc-200">
                  Ongkir = (Jarak × Rp 2.500) + (Berat × Rp 5.000)
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  *Total biaya selalu dibulatkan ke atas (*round up*) ke kelipatan <strong>Rp 5.000</strong> terdekat.
                </p>
              </div>

              {/* Contoh simulasi */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 space-y-2">
                <p className="font-semibold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>💡</span> Simulasi Contoh Pengiriman
                </p>
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-800/60">
                    <p className="font-semibold text-white">Contoh 1: Jarak 1 km &amp; Berat 1 kg</p>
                    <p className="text-zinc-400 mt-0.5">
                      Perhitungan: (1 km × Rp 2.500) + (1 kg × Rp 5.000) = Rp 7.500
                    </p>
                    <p className="text-emerald-400 font-semibold mt-0.5">
                      &rarr; Ongkir Akhir: Rp 10.000 (dibulatkan ke kelipatan Rp 5.000)
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-800/60">
                    <p className="font-semibold text-white">Contoh 2: Jarak 3 km &amp; Berat 2 kg</p>
                    <p className="text-zinc-400 mt-0.5">
                      Perhitungan: (3 km × Rp 2.500) + (2 kg × Rp 5.000) = Rp 7.500 + Rp 10.000 = Rp 17.500
                    </p>
                    <p className="text-emerald-400 font-semibold mt-0.5">
                      &rarr; Ongkir Akhir: Rp 20.000 (dibulatkan ke kelipatan Rp 5.000)
                    </p>
                  </div>
                </div>
              </div>

              {/* Opsi COD Surabaya / Titik Temu */}
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5">
                <p className="font-semibold text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>🤝</span> Opsi COD / Titik Temu Surabaya: Gratis (Rp 0)
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Jika memilih metode COD / ketemuan langsung di titik temu area Surabaya (misal minimarket, taman, atau kampus), tidak dikenakan biaya ongkos kirim.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Link
                href="/bantuan"
                onClick={() => setShippingModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-white hover:underline"
              >
                Pertanyaan lainnya? Buka FAQ &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setShippingModalOpen(false)}
                className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {sellerPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161616] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-white">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                    <path d="M2 7h20" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Kelola Toko
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Khusus Penjual Terverifikasi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSellerPromptOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
                aria-label="Tutup modal ajakan penjual"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm text-zinc-300">
              <p className="leading-relaxed">
                Anda belum terdaftar sebagai penjual di <strong className="text-white">BaranginAja</strong>.
              </p>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 space-y-2 text-xs text-zinc-400">
                <p className="font-semibold text-zinc-200">
                  Keuntungan Menjadi Penjual:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Unggah & kelola produk jualan mahasiswa</li>
                  <li>Pantau pesanan masuk secara real-time</li>
                  <li>Tarik pendapatan jualan langsung ke rekening Anda</li>
                </ul>
              </div>
              <p className="text-xs text-zinc-400">
                Ayo aktifkan akun penjual Anda sekarang melalui halaman profil!
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSellerPromptOpen(false)}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
              >
                Nanti Saja
              </button>
              <button
                type="button"
                onClick={() => {
                  setSellerPromptOpen(false);
                  router.push("/profil");
                }}
                className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 cursor-pointer shadow-sm"
              >
                Daftar Sebagai Penjual &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL RATING KEPUASAN WEBSITE                                             */}
      {/* ========================================================================= */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161616] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400 font-bold text-base border border-yellow-500/30">
                  ⭐
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Rating Kepuasan Website
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Bantu kami meningkatkan kualitas BaranginAja
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRatingModalOpen(false);
                  setRatingSubmitted(false);
                }}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
                aria-label="Tutup modal rating"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {ratingSubmitted ? (
              <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl border border-emerald-500/30">
                  🎉
                </div>
                <h4 className="text-lg font-bold text-white">
                  Terima Kasih Banyak!
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Penilaian dan masukan Anda sangat berharga untuk terus memajukan platform marketplace warga &amp; mahasiswa Surabaya.
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRatingModalOpen(false);
                      setRatingSubmitted(false);
                    }}
                    className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 cursor-pointer transition-colors shadow-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {/* Star Selector */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (ratingHover || ratingScore) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setRatingHover(star)}
                          onMouseLeave={() => setRatingHover(0)}
                          onClick={() => setRatingScore(star)}
                          className="p-1 transition-transform hover:scale-110 cursor-pointer"
                          aria-label={`Beri bintang ${star}`}
                        >
                          <svg
                            className={`h-8 w-8 transition-colors ${
                              active ? "text-yellow-400 fill-yellow-400" : "text-zinc-700 fill-transparent"
                            }`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-semibold text-yellow-400">
                    {ratingScore === 5 && "Sangat Puas! ⭐⭐⭐⭐⭐"}
                    {ratingScore === 4 && "Puas & Keren! 👍"}
                    {ratingScore === 3 && "Cukup Baik 🙂"}
                    {ratingScore === 2 && "Kurang Memuaskan 🙁"}
                    {ratingScore === 1 && "Perlu Banyak Perbaikan ⚠️"}
                  </p>
                </div>

                {/* Quick Chips */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Apa yang paling Anda sukai?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Tampilan Rapi & Modern",
                      "Cepat & Ringan",
                      "Mudah Digunakan",
                      "Tanpa Potongan Komisi",
                      "Bermanfaat untuk Kampus",
                    ].map((tag) => {
                      const selected = ratingTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setRatingTags(ratingTags.filter((t) => t !== tag));
                            } else {
                              setRatingTags([...ratingTags, tag]);
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            selected
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-medium"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback text */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Saran &amp; Masukan Tambahan
                  </label>
                  <textarea
                    rows={3}
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    placeholder="Tulis pendapat atau ide fitur yang Anda inginkan..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-hidden resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRatingModalOpen(false)}
                    className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRatingSubmitted(true);
                    }}
                    className="rounded-lg bg-yellow-500 hover:bg-yellow-400 px-4 py-2 text-xs font-bold text-zinc-950 cursor-pointer shadow-sm transition-colors"
                  >
                    Kirim Penilaian &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
