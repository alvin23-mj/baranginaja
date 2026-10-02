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
}: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Dropdown & modal states (activeDropdown is mutually exclusive: "user" | "help" | null)
  const [activeDropdown, setActiveDropdown] = useState<"user" | "help" | null>(null);
  const [lockedDropdown, setLockedDropdown] = useState<"user" | "help" | null>(null);
  const [userDropdownPos, setUserDropdownPos] = useState({ top: 0, right: 0 });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [ratingTags, setRatingTags] = useState<string[]>([]);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userBarRef = useRef<HTMLDivElement>(null);
  const userToggleRef = useRef<HTMLButtonElement>(null);
  const helpToggleRef = useRef<HTMLButtonElement>(null);
  const userDropdownPanelRef = useRef<HTMLDivElement>(null);

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
    if (userToggleRef.current) {
      const rect = userToggleRef.current.getBoundingClientRect();
      setUserDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
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
      if (userToggleRef.current) {
        const rect = userToggleRef.current.getBoundingClientRect();
        setUserDropdownPos({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right,
        });
      }
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

      const isInsideUserBar = userBarRef.current?.contains(target);

      if (!isInsideUserToggle && !isInsideHelpToggle && !isInsideDropdown && !isInsideUserBar) {
        closeDropdowns();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close all menus on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    closeDropdowns();
    setShippingModalOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleStoreClick = () => {
    if (!user) {
      router.push("/login?redirectTo=/jual");
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
        ? "text-zinc-900 font-semibold"
        : "text-zinc-500 hover:text-zinc-900 font-medium"
    }`;

  const mobileNavLinkClass = (href: string) =>
    `block px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
      isActive(href)
        ? "bg-zinc-100 text-zinc-900 font-semibold"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  // Admin routes, user dashboard, and auth pages use their own clean layout without main navbar
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/jual") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200 shadow-sm">
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
            <span className="text-xl sm:text-[22px] font-bold tracking-tight text-zinc-900 select-none">
              barangin<span className="text-amber-600">aja</span>
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
            suppressHydrationWarning
            ref={helpToggleRef}
            type="button"
            onMouseEnter={handleHelpMouseEnter}
            onMouseLeave={handleHelpMouseLeave}
            onClick={handleHelpClick}
            className={`inline-flex items-center gap-2 text-sm lg:text-[15px] font-medium transition-colors duration-150 cursor-pointer ${
              activeDropdown === "help" || isActive("/bantuan")
                ? "text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
            aria-label="Menu Bantuan"
          >
            <span>Bantuan</span>
            <svg
              className={`h-3.5 w-3.5 transition-colors duration-150 ${
                activeDropdown === "help" ? "text-zinc-900" : "text-zinc-400"
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
        <div className="flex items-center gap-4 lg:gap-6 shrink-0 z-10">
          {/* Ikon Toko / Kelola Toko */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={handleStoreClick}
            className="text-zinc-400 hover:text-zinc-900 transition-colors p-1 cursor-pointer flex items-center justify-center"
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
              <path d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016 2.993 2.993 0 0 0 2.25-1.016 3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          </button>

          {/* Masuk / Menu Pengguna */}
          {user ? (
            <button
              suppressHydrationWarning
              ref={userToggleRef}
              type="button"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
              onClick={handleUserClick}
              className={`inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-150 cursor-pointer py-1.5 ${
                activeDropdown === "user"
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
              aria-label="Menu Pengguna"
            >
              <span className="truncate max-w-[100px] sm:max-w-[130px]">
                {user.name ? user.name.split(" ").slice(0, 2).join(" ") : "Akun"}
              </span>
              <svg
                className={`h-3.5 w-3.5 transition-colors duration-150 ${
                  activeDropdown === "user" ? "text-zinc-900" : "text-zinc-400"
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
              className="text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors px-3 py-2 cursor-pointer"
            >
              Masuk
            </Link>
          )}

          {/* Tombol Jual Barang (rounded-lg) */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => {
              if (!user) {
                router.push("/login?redirectTo=/jual/tambah");
                return;
              }
              if (!isSeller) {
                router.push("/jual?view=penjual");
                return;
              }
              router.push("/jual/tambah");
            }}
            className="inline-flex items-center justify-center bg-zinc-900 text-white hover:bg-zinc-700 active:scale-95 transition-all duration-150 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm cursor-pointer"
          >
            Jual Barang
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-500 hover:text-zinc-900 md:hidden cursor-pointer"
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
      {/* DROPDOWN BAR: BANTUAN (full-width bar)                                    */}
      {/* ========================================================================= */}
      <div
        ref={userDropdownRef}
        onMouseEnter={handleDropdownBarMouseEnter}
        onMouseLeave={handleDropdownBarMouseLeave}
        className={`w-full overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-zinc-100 ${
          activeDropdown === "help"
            ? "max-h-64 opacity-100 pt-6 pb-5 sm:pt-7 sm:pb-6"
            : "max-h-0 opacity-0 pt-0 pb-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dropdown Bantuan: 4 Kolom */}
          {activeDropdown === "help" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-200 w-full animate-in fade-in duration-150">
              {/* Kolom 1: Panduan Transaksi */}
              <div className="py-2 pr-4 sm:pr-6 flex flex-col items-start gap-2.5">
                <span className="text-[15px] font-semibold text-zinc-900">
                  Panduan Transaksi
                </span>
                <div className="flex flex-col items-start gap-2 w-full">
                  <Link
                    href="/panduan/cara-membeli"
                    onClick={closeDropdowns}
                    className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer text-left"
                  >
                    Cara Membeli
                  </Link>

                  <Link
                    href="/panduan/cara-menjual"
                    onClick={closeDropdowns}
                    className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer text-left"
                  >
                    Cara Menjual
                  </Link>

                  <Link
                    href="/panduan/daftar-penjual"
                    onClick={closeDropdowns}
                    className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer text-left"
                  >
                    Daftar Jadi Penjual
                  </Link>
                </div>
              </div>

              {/* Kolom 2: Pengiriman & Keamanan */}
              <div className="py-2 px-4 sm:px-6 flex flex-col items-start gap-2.5">
                <span className="text-[15px] font-semibold text-zinc-900">
                  Pengiriman & Keamanan
                </span>
                <div className="flex flex-col items-start gap-2 w-full">
                  <Link
                    href="/panduan/tarif-ongkir"
                    onClick={closeDropdowns}
                    className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer text-left"
                  >
                    Tarif & Ongkir
                  </Link>

                  <Link
                    href="/panduan/keamanan-cod"
                    onClick={closeDropdowns}
                    className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer text-left"
                  >
                    Keamanan & COD
                  </Link>
                </div>
              </div>

              {/* Kolom 3: Layanan Bantuan */}
              <div className="py-2 px-4 sm:px-6 flex flex-col items-start gap-2.5">
                <span className="text-[15px] font-semibold text-zinc-900">
                  Layanan Bantuan
                </span>
                <div className="flex flex-col items-start gap-2 w-full">
                  <Link
                    href="/bantuan"
                    onClick={closeDropdowns}
                    className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer"
                  >
                    Pusat Bantuan
                  </Link>

                  <Link
                    href="/faq"
                    onClick={closeDropdowns}
                    className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer"
                  >
                    Pertanyaan Umum (FAQ)
                  </Link>
                </div>
              </div>

              {/* Kolom 4: Dukungan & Ulasan */}
              <div className="py-2 pl-4 sm:pl-6 flex flex-col items-start gap-2.5">
                <span className="text-[15px] font-semibold text-zinc-900">
                  Dukungan & Ulasan
                </span>
                <div className="flex flex-col items-start gap-2 w-full">
                  <a
                    href="https://saweria.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeDropdowns}
                    className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer"
                  >
                    Beri Kami Semangat
                  </a>

                  <Link
                    href="/ulasan"
                    onClick={closeDropdowns}
                    className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer text-left"
                  >
                    Rating Kepuasan Website
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* ========================================================================= */}
      {/* DROPDOWN USER: Full-width bar (seperti Bantuan)                           */}
      {/* ========================================================================= */}
      {user && (
        <div
          ref={userBarRef}
          onMouseEnter={() => clearDropdownTimeout()}
          onMouseLeave={handleUserMouseLeave}
          className={`w-full overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-zinc-100 ${
            activeDropdown === "user"
              ? "max-h-72 opacity-100 pt-6 pb-5 sm:pt-7 sm:pb-6"
              : "max-h-0 opacity-0 pt-0 pb-0 pointer-events-none"
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {activeDropdown === "user" && (
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 w-full animate-in fade-in duration-150">

                {/* Kolom 1: Info Pengguna */}
                <div className="py-2 pr-4 sm:pr-6 flex flex-col items-start gap-2">
                  <span className="text-[15px] font-semibold text-zinc-900">
                    {user.name || "Pengguna"}
                  </span>
                  <p className="text-[14px] text-zinc-400">{user.email}</p>
                </div>

                {/* Kolom 2: Akun Saya */}
                <div className="py-2 px-4 sm:px-6 flex flex-col items-start gap-2.5">
                  <span className="text-[15px] font-semibold text-zinc-900">
                    Akun Saya
                  </span>
                  <div className="flex flex-col items-start gap-2 w-full">
                    <Link
                      href="/profil"
                      onClick={closeDropdowns}
                      className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer text-left"
                    >
                      Profil Saya
                    </Link>
                  </div>
                </div>

                {/* Kolom 3: Lainnya */}
                <div className="py-2 pl-4 sm:pl-6 flex flex-col items-start gap-2.5">
                  <span className="text-[15px] font-semibold text-zinc-900">
                    Lainnya
                  </span>
                  <div className="flex flex-col items-start gap-2 w-full">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={closeDropdowns}
                        className="py-1 text-[14px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer text-left"
                      >
                        Panel Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleDirectLogout}
                      disabled={logoutLoading}
                      className="py-1 text-[14px] font-medium text-red-500 hover:text-red-700 transition-colors duration-150 cursor-pointer text-left"
                    >
                      {logoutLoading ? "Memproses Keluar..." : "Keluar dari Akun"}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE DRAWER MENU                                                        */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 md:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {(districtName || campusName) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-zinc-500"
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

            <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
            <Link
              href="/bantuan"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
              Pusat Bantuan
            </Link>
            <Link
              href="/panduan/tarif-ongkir"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
              Tarif & Ongkir
            </Link>
            <Link
              href="/panduan/keamanan-cod"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
              Keamanan & COD
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
              Pertanyaan Umum (FAQ)
            </Link>
            <a
              href="https://saweria.co"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
              Beri Kami Semangat
            </a>
            <Link
              href="/ulasan"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
              Rating Kepuasan Website
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleStoreClick();
              }}
              className="text-left block w-full px-3 py-2.5 rounded-lg text-[15px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            >
              Kelola Toko
            </button>

            {user && isSeller && (
              <>
                <p className="px-3 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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

            <div className="mt-3 border-t border-zinc-200 pt-3">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/profil"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                  >
                    Profil Saya ({user.name || user.email})
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
                    className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 cursor-pointer"
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
                <p className="font-semibold text-white flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Transaksi Mahasiswa Terverifikasi
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Semua penjual dan pembeli terdaftar dengan email kampus aktif demi kenyamanan dan keamanan transaksi.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                <p className="font-semibold text-white flex items-center gap-2">
                  <svg className="h-4 w-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  COD di Lingkungan Kampus
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Bisa janjian bertemu langsung (COD) di perpustakaan, kantin, atau lobi fakultas tanpa biaya admin.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                <p className="font-semibold text-white flex items-center gap-2">
                  <svg className="h-4 w-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Ada Kendala?
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
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-white">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 102 0 1 1 0 00-2 0zm-7 0a1 1 0 102 0 1 1 0 00-2 0z" /></svg>
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
                <p className="font-semibold text-white flex items-center gap-2 text-xs sm:text-sm">
                  <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  Rumus Perhitungan Kurir
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
                <p className="font-semibold text-white flex items-center gap-2 text-xs sm:text-sm">
                  <svg className="h-4 w-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  Simulasi Contoh Pengiriman
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
                <p className="font-semibold text-emerald-300 flex items-center gap-2 text-xs sm:text-sm">
                  <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Opsi COD / Titik Temu Surabaya: Gratis (Rp 0)
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


      {/* ========================================================================= */}
      {/* MODAL RATING KEPUASAN WEBSITE                                             */}
      {/* ========================================================================= */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#161616] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <svg className="h-5 w-5 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
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
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                  <p className="text-xs font-semibold text-amber-400">
                    {ratingScore === 5 && "Sangat Puas!"}
                    {ratingScore === 4 && "Puas & Keren!"}
                    {ratingScore === 3 && "Cukup Baik"}
                    {ratingScore === 2 && "Kurang Memuaskan"}
                    {ratingScore === 1 && "Perlu Banyak Perbaikan"}
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
