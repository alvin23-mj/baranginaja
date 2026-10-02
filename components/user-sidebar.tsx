"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Lock } from "lucide-react";

interface UserSidebarProps {
  pendingBuyerOrdersCount?: number;
  isSeller?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  view?: string;
  badge?: number | string;
  sellerOnly?: boolean;
  icon: (active: boolean, muted?: boolean) => React.ReactNode;
}

export function UserSidebar({
  pendingBuyerOrdersCount = 0,
  isSeller = true,
}: UserSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, currentView]);

  const isActive = (item: NavItem) => {
    if (item.view) {
      return currentView === item.view;
    }
    return (
      (pathname === "/jual" && (!currentView || currentView === "dashboard")) ||
      (pathname.startsWith("/jual") &&
        !item.view &&
        pathname !== "/jual/tambah" &&
        !pathname.startsWith("/jual/edit"))
    );
  };

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/jual?view=dashboard",
      view: "dashboard",
      icon: (active, muted) => (
        <svg
          className={`h-5 w-5 transition-colors ${
            muted
              ? "text-zinc-400 dark:text-zinc-600"
              : active
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      label: "Penjual",
      href: "/jual?view=penjual",
      view: "penjual",
      sellerOnly: true,
      icon: (active, muted) => (
        <svg
          className={`h-5 w-5 transition-colors ${
            muted
              ? "text-zinc-400 dark:text-zinc-600"
              : active
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.614A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.015a2.993 2.993 0 0 0 2.25 1.015c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0L5.27 4.148A2.25 2.25 0 0 1 7.28 3h9.44a2.25 2.25 0 0 1 2.01 1.148l1.52 5.201"
          />
        </svg>
      ),
    },
    {
      label: "Pembeli",
      href: "/jual?view=pembeli",
      view: "pembeli",
      badge: pendingBuyerOrdersCount > 0 ? `${pendingBuyerOrdersCount} aktif` : undefined,
      icon: (active, muted) => (
        <svg
          className={`h-5 w-5 transition-colors ${
            muted
              ? "text-zinc-400 dark:text-zinc-600"
              : active
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      ),
    },
    {
      label: "Pendapatan",
      href: "/jual?view=pendapatan",
      view: "pendapatan",
      sellerOnly: true,
      icon: (active, muted) => (
        <svg
          className={`h-5 w-5 transition-colors ${
            muted
              ? "text-zinc-400 dark:text-zinc-600"
              : active
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  const renderNavLinks = () => (
    <div className="flex flex-col gap-1.5">
      <p className="px-3 text-sm font-normal text-zinc-400 dark:text-zinc-500 mb-1">
        Menu Utama
      </p>
      {navItems.map((item) => {
        const active = isActive(item);
        const isMuted = Boolean(item.sellerOnly && !isSeller);

        return (
          <Link
            key={item.label}
            href={item.href}
            title={isMuted ? "Fitur khusus penjual. Aktifkan akun penjual di profil." : undefined}
            className={`group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              isMuted
                ? active
                  ? "bg-zinc-100/70 text-zinc-400 dark:bg-zinc-800/40 dark:text-zinc-500 font-normal"
                  : "text-zinc-400 hover:bg-zinc-100/50 hover:text-zinc-500 dark:text-zinc-500 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-400 font-normal"
                : active
                ? "bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-medium"
                : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100 font-normal"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.icon(active, isMuted)}
              <span className="truncate">{item.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isMuted && (
                <Lock
                  className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0"
                  strokeWidth={1.8}
                  aria-label="Khusus Penjual"
                />
              )}
              {item.badge && !isMuted && (
                <span className="rounded-full px-2 py-0.5 text-sm font-normal bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <header className="md:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Link href="/" className="inline-flex items-center group" aria-label="baranginaja">
            <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 select-none">
              barangin<span className="text-amber-600">aja</span>
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Buka Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl dark:bg-zinc-900">
            <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Link href="/" className="inline-flex items-center group" aria-label="baranginaja">
                  <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 select-none">
                    barangin<span className="text-amber-600">aja</span>
                  </span>
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">{renderNavLinks()}</div>

            {/* Bottom Button: Kembali ke Halaman Beranda */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors shadow-2xs"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sticky top-0 h-screen">
        {/* Sidebar Top: height h-16 matching Top Body */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            className="inline-flex items-center group transition-opacity hover:opacity-90"
            aria-label="baranginaja"
          >
            <span className="text-[22px] font-bold tracking-tight text-zinc-950 dark:text-zinc-50 select-none">
              barangin<span className="text-amber-600">aja</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="p-5 flex-1 overflow-y-auto">{renderNavLinks()}</div>

        {/* Bottom Button: Kembali ke Halaman Beranda */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
