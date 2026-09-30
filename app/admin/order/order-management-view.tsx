"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah, calculateHargaJual } from "@/lib/pricing";
import { ORDER_STATUS_LABEL, ORDER_STATUS_CLASS } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { createPayoutIfNeeded } from "@/lib/payouts";
import { OrderCountdownBadge } from "@/components/order-countdown-badge";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time || "Loading..."}</span>;
}

export interface DetailedOrderProduct {
  id: string;
  nama_barang: string;
  foto_urls: string[];
  berat_kg: number;
  harga_input: number;
  harga_jual?: number | null;
  kondisi?: string | null;
  seller?: {
    id: string;
    nama_lengkap: string;
    no_hp: string;
    alamat_kos?: string | null;
    status_verifikasi?: string | null;
    kecamatan?: { nama_kecamatan: string } | null;
    kampus?: { nama_kampus: string } | null;
  } | null;
}

export interface DetailedOrderBuyer {
  id: string;
  nama_lengkap: string;
  no_hp: string;
  alamat_kos?: string | null;
  kecamatan?: { nama_kecamatan: string } | null;
  kampus?: { nama_kampus: string } | null;
}

export interface AdminOrderListItemFull {
  id: string;
  product_id: string;
  buyer_id: string;
  opsi_pengiriman: "cod" | "kurir";
  jarak_km: number | null;
  ongkir: number | null;
  total_harga: number;
  status: OrderStatus;
  bukti_bayar_url: string | null;
  hold_expires_at: string | null;
  dikonfirmasi_diterima_at: string | null;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
  product: DetailedOrderProduct | null;
  buyer: DetailedOrderBuyer | null;
}

interface OrderManagementViewProps {
  initialOrders: AdminOrderListItemFull[];
  adminId: string;
}

const ORDER_STATUS_LIST: OrderStatus[] = [
  "Menunggu Pembayaran",
  "Dibayar",
  "Dijemput",
  "Dalam Pengiriman",
  "Diterima",
  "Selesai",
  "Dibatalkan",
];

import { ThemeToggle } from "@/components/theme-toggle";

export function OrderManagementView({
  initialOrders,
  adminId,
}: OrderManagementViewProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrderListItemFull[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama" | "tertinggi">("terbaru");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<AdminOrderListItemFull | null>(null);

  const itemsPerPage = 8;

  // Update props sync
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(initialOrders);
  }, [initialOrders]);

  // Memoized counts for tabs
  const {
    countAll,
    countPending,
    countDibayar,
    countDijemput,
    countPengiriman,
    countSelesai,
    countDibatalkan,
    countSelesaiHariIni,
  } = useMemo(() => {
    const today = new Date();
    let pending = 0;
    let dibayar = 0;
    let dijemput = 0;
    let pengiriman = 0;
    let selesai = 0;
    let dibatalkan = 0;
    let selesaiHariIni = 0;

    orders.forEach((o) => {
      if (o.status === "Menunggu Pembayaran") pending++;
      else if (o.status === "Dibayar") dibayar++;
      else if (o.status === "Dijemput") dijemput++;
      else if (o.status === "Dalam Pengiriman") pengiriman++;
      else if (o.status === "Selesai") {
        selesai++;
        const dateStr = o.completed_at || o.created_at;
        if (dateStr) {
          const d = new Date(dateStr);
          if (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          ) {
            selesaiHariIni++;
          }
        }
      } else if (o.status === "Dibatalkan") dibatalkan++;
    });

    return {
      countAll: orders.length,
      countPending: pending,
      countDibayar: dibayar,
      countDijemput: dijemput,
      countPengiriman: pengiriman,
      countSelesai: selesai,
      countDibatalkan: dibatalkan,
      countSelesaiHariIni: selesaiHariIni,
    };
  }, [orders]);

  // Memoized Filter & Search & Sort
  const filteredOrders = useMemo(() => {
    const list = orders.filter((order) => {
      if (activeTab !== "all" && order.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const orderId = order.id.toLowerCase();
        const namaBarang = order.product?.nama_barang?.toLowerCase() ?? "";
        const namaBuyer = order.buyer?.nama_lengkap?.toLowerCase() ?? "";
        const namaSeller = order.product?.seller?.nama_lengkap?.toLowerCase() ?? "";
        const noHpBuyer = order.buyer?.no_hp?.toLowerCase() ?? "";
        return (
          orderId.includes(q) ||
          namaBarang.includes(q) ||
          namaBuyer.includes(q) ||
          namaSeller.includes(q) ||
          noHpBuyer.includes(q)
        );
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "terlama") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "tertinggi") {
        return b.total_harga - a.total_harga;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [orders, activeTab, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Copy Order ID
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status Change Handler
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    const supabase = createClient();
    const targetOrder = orders.find((o) => o.id === orderId);

    if (!targetOrder) return;

    const updates: Partial<AdminOrderListItemFull> = {
      status: newStatus,
    };

    if (newStatus === "Dibayar" && !targetOrder.paid_at) {
      updates.paid_at = new Date().toISOString();
    }
    if (newStatus === "Selesai" && !targetOrder.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (error) {
      alert(`Gagal memperbarui status: ${error.message}`);
      setUpdatingOrderId(null);
      return;
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      admin_id: adminId,
      order_id: orderId,
      aksi: `Mengubah status order #${orderId.slice(0, 8)} menjadi ${newStatus}`,
      timestamp: new Date().toISOString(),
    });

    // If marked Selesai, payout & product status teruji
    if (newStatus === "Selesai") {
      if (targetOrder.product_id) {
        await supabase
          .from("products")
          .update({ status: "Terjual" })
          .eq("id", targetOrder.product_id);
      }

      if (targetOrder.product?.seller?.id) {
        const nominalPayout = targetOrder.product.harga_input ?? 0;
        await createPayoutIfNeeded(supabase, {
          orderId,
          sellerId: targetOrder.product.seller.id,
          nominal: nominalPayout,
        });
      }
    }

    // Update local state
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
    setUpdatingOrderId(null);
    router.refresh();
  };

  // WhatsApp Handler
  const handleOpenWhatsApp = (phone?: string, name?: string, orderId?: string) => {
    if (!phone) {
      alert("Nomor telepon tidak tersedia.");
      return;
    }
    let formattedPhone = phone.replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }
    const msg = `Halo ${name || "Kak"}, mengenai pesanan #${orderId?.slice(0, 8)} di BaranginAja:`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "ID Order",
      "Tanggal",
      "Nama Barang",
      "Pembeli",
      "No HP Pembeli",
      "Penjual",
      "Opsi Pengiriman",
      "Ongkir",
      "Total Tagihan",
      "Status",
    ];

    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.created_at).toLocaleString("id-ID"),
      `"${o.product?.nama_barang?.replace(/"/g, '""') || "-"}"`,
      `"${o.buyer?.nama_lengkap?.replace(/"/g, '""') || "-"}"`,
      `"${o.buyer?.no_hp || "-"}"`,
      `"${o.product?.seller?.nama_lengkap?.replace(/"/g, '""') || "-"}"`,
      o.opsi_pengiriman === "cod" ? "COD / Ambil Sendiri" : "Kurir Platform",
      o.ongkir || 0,
      o.total_harga,
      o.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `pesanan-baranginaja-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      {/* ---- Top Header Bar ---- */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              Kelola Order &amp; Resi Pengiriman
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE SYNC
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Pusat kontrol pemrosesan pesanan, status pembayaran QRIS &amp; kurir
          </p>
        </div>

        {/* Right Search & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[240px] sm:min-w-[300px]">
            <input
              suppressHydrationWarning
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Order ID, No. Resi, nama..."
              className="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pl-9 pr-9 text-xs text-zinc-950 shadow-2xs placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <svg className="absolute left-3 top-2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="absolute right-2.5 top-1.5 rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              ⌘K
            </span>
          </div>

          {/* Date Clock Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <LiveClock />
          </div>

          {/* Theme Toggle Dropdown */}
          <ThemeToggle />
        </div>
      </div>

      {/* ---- Top 2 Summary Stat Cards ---- */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 max-w-xl">
        {/* Card 1: SEMUA PESANAN */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              SEMUA PESANAN
            </span>
            <p className="mt-1 text-2xl font-black text-zinc-950 dark:text-zinc-50">
              {countAll}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>

        {/* Card 2: SELESAI HARI INI */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              SELESAI HARI INI
            </span>
            <p className="mt-1 text-2xl font-black text-zinc-950 dark:text-zinc-50">
              {countSelesaiHariIni}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ---- Status Filter Tabs & Controls Row ---- */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            Semua Status
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${activeTab === "all" ? "bg-zinc-800 text-white dark:bg-zinc-300 dark:text-zinc-950" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"}`}>
              {countAll}
            </span>
          </button>

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => {
              setActiveTab("Menunggu Pembayaran");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "Menunggu Pembayaran"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400"
            }`}
          >
            Menunggu QRIS (Pending)
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px]">
              {countPending}
            </span>
          </button>

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => {
              setActiveTab("Dibayar");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "Dibayar"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400"
            }`}
          >
            Dibayar
            <span className="rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[10px]">
              {countDibayar}
            </span>
          </button>

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => {
              setActiveTab("Dijemput");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "Dijemput"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 dark:bg-purple-950/40 dark:text-purple-400"
            }`}
          >
            Dijemput Kurir
            <span className="rounded-full bg-purple-500/20 px-1.5 py-0.2 text-[10px]">
              {countDijemput}
            </span>
          </button>

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => {
              setActiveTab("Dalam Pengiriman");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "Dalam Pengiriman"
                ? "bg-cyan-600 text-white shadow-xs"
                : "bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/20 dark:bg-cyan-950/40 dark:text-cyan-400"
            }`}
          >
            Dalam Pengiriman
            <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[10px]">
              {countPengiriman}
            </span>
          </button>

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => {
              setActiveTab("Selesai");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "Selesai"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400"
            }`}
          >
            Selesai
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px]">
              {countSelesai}
            </span>
          </button>

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => {
              setActiveTab("Dibatalkan");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "Dibatalkan"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:bg-rose-950/40 dark:text-rose-400"
            }`}
          >
            Dibatalkan
            <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px]">
              {countDibatalkan}
            </span>
          </button>
        </div>

        {/* Right Sort & Export */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            suppressHydrationWarning
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "terbaru" | "terlama" | "tertinggi")}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-950 shadow-2xs focus:border-zinc-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="terbaru">Urutkan: Waktu Terbaru</option>
            <option value="terlama">Urutkan: Waktu Terlama</option>
            <option value="tertinggi">Urutkan: Total Tagihan</option>
          </select>

          <button
            suppressHydrationWarning
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* ---- Order Cards List ---- */}
      {paginatedOrders.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white py-20 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <svg className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-3 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Tidak Ada Pesanan Ditemukan
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Coba ubah kata kunci pencarian atau filter status yang Anda pilih.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => {
            const product = order.product;
            const buyer = order.buyer;
            const seller = product?.seller;

            const isUpdating = updatingOrderId === order.id;

            const hargaInput = product?.harga_input ?? 0;
            const hargaJual =
              product?.harga_jual ?? calculateHargaJual(hargaInput).hargaJual;

            const initialSellerName = seller?.nama_lengkap
              ? seller.nama_lengkap
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "SP";

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Order Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Order ID with Copy */}
                    <div className="flex items-center gap-1 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      <span># {order.id}</span>
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => handleCopyId(order.id)}
                        title="Salin Order ID"
                        className="rounded p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      >
                        {copiedId === order.id ? (
                          <span className="text-[10px] text-emerald-600 font-sans font-bold">Tersalin!</span>
                        ) : (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        ORDER_STATUS_CLASS[order.status]
                      }`}
                    >
                      • {ORDER_STATUS_LABEL[order.status]}
                    </span>

                    {/* Live Running Hold Countdown Timer */}
                    {order.status === "Menunggu Pembayaran" && (
                      <OrderCountdownBadge holdExpiresAt={order.hold_expires_at} />
                    )}

                    <span className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {order.opsi_pengiriman === "kurir" ? "Kurir Instan" : "Ambil Sendiri"}
                    </span>
                  </div>

                  {/* Total Tagihan */}
                  <div className="text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      TOTAL TAGIHAN
                    </span>
                    <p className="text-lg font-black text-zinc-950 dark:text-zinc-50">
                      {formatRupiah(order.total_harga)}
                    </p>
                  </div>
                </div>

                {/* Sub-meta line */}
                <div className="px-4 py-2 text-xs border-b border-zinc-100 text-zinc-600 dark:border-zinc-800/80 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                    Pembeli: {buyer?.nama_lengkap || "User"}
                  </span>{" "}
                  <span className="text-zinc-400 font-mono">({buyer?.no_hp || "-"})</span> •{" "}
                  <span>📅 {new Date(order.created_at).toLocaleString("id-ID")}</span>
                </div>

                {/* Card Inner 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                  {/* Col 1: Detail Barang */}
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-800/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          DETAIL BARANG
                        </span>
                        <span className="rounded-md bg-zinc-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                          1 Barang
                        </span>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 flex items-center justify-center">
                          {product?.foto_urls?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.foto_urls[0]}
                              alt={product.nama_barang}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-zinc-950 dark:text-zinc-100 line-clamp-2">
                            {product?.nama_barang || "Produk Dihapus"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Harga Satuan:{" "}
                            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                              {formatRupiah(hargaJual)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span>Kondisi: <strong className="text-zinc-700 dark:text-zinc-300">{product?.kondisi || "Sangat Baik"}</strong></span>
                      <span className="font-mono text-[10px]">SKU: {product?.id ? product.id.slice(0, 8).toUpperCase() : "-"}</span>
                    </div>
                  </div>

                  {/* Col 2: Penjual (Seller) */}
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-800/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          PENJUAL (SELLER)
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Terverifikasi
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 font-bold text-xs text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                          {initialSellerName}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
                            {seller?.nama_lengkap || "Penjual"}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {seller?.no_hp || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-0.5">
                          ALAMAT JEMPUT:
                        </span>
                        <p className="line-clamp-2 text-xs">
                          {seller?.alamat_kos || seller?.kampus?.nama_kampus || seller?.kecamatan?.nama_kecamatan || "Lokasi Seller"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400">
                      📍 Area: <strong className="text-zinc-700 dark:text-zinc-300">{seller?.kecamatan?.nama_kecamatan || seller?.kampus?.nama_kampus || "Surabaya"}</strong>
                    </div>
                  </div>

                  {/* Col 3: Pengiriman & Logistik */}
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-800/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          PENGIRIMAN &amp; LOGISTIK
                        </span>
                        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                          {order.opsi_pengiriman === "kurir" ? "Instan / Kurir" : "Self Pickup"}
                        </span>
                      </div>

                      {/* Distance & Ongkir Pill Box */}
                      <div className="rounded-lg border border-zinc-200/70 bg-white p-2.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
                        {order.opsi_pengiriman === "kurir" ? (
                          <div className="flex items-center justify-between">
                            <span>Jarak: <strong>{order.jarak_km ?? "0.5"} km</strong></span>
                            <span>•</span>
                            <span>Ongkir: <strong className="text-emerald-600 dark:text-emerald-400">{formatRupiah(order.ongkir ?? 0)}</strong></span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>Metode: <strong>COD / Ketemuan</strong></span>
                            <span>•</span>
                            <span>Ongkir: <strong className="text-emerald-600 dark:text-emerald-400">Gratis (Rp 0)</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-0.5">
                          {order.opsi_pengiriman === "kurir" ? "ALAMAT PEMBELI:" : "LOKASI PERTEMUAN:"}
                        </span>
                        <p className="line-clamp-2 text-xs">
                          {buyer?.alamat_kos || buyer?.kampus?.nama_kampus || buyer?.kecamatan?.nama_kecamatan || "Alamat Pembeli"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[11px] text-emerald-600 font-medium dark:text-emerald-400 flex items-center gap-1">
                      <span>+</span>
                      <span>
                        {order.jarak_km && order.jarak_km < 1
                          ? "Radius Sangat Dekat (< 1km)"
                          : "Siap Diambil oleh Pembeli / Kurir"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bar Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/30">
                  {/* Status Dropdown Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Status:
                    </span>
                    <select
                      suppressHydrationWarning
                      disabled={isUpdating}
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 shadow-2xs focus:border-zinc-500 focus:outline-hidden disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      {ORDER_STATUS_LIST.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {isUpdating && (
                      <span className="text-xs text-zinc-500 animate-spin">⏳</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Cetak Label Button */}
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => setSelectedPrintOrder(order)}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Cetak Label
                    </button>

                    {/* Detail Button */}
                    <Link
                      href={`/admin/order/${order.id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      Detail
                    </Link>

                    {/* Chat WhatsApp Button */}
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() =>
                        handleOpenWhatsApp(buyer?.no_hp, buyer?.nama_lengkap, order.id)
                      }
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.553 4.197 1.604 6.02L.07 23.93l5.992-1.571a12.012 12.012 0 005.97 1.575h.005c6.646 0 12.031-5.386 12.031-12.031C24.068 5.385 18.68 0 12.031 0zM12.03 22.02h-.004a9.96 9.96 0 01-5.077-1.39l-.364-.216-3.766.987 1.004-3.672-.237-.377a9.967 9.967 0 01-1.528-5.321c0-5.503 4.478-9.981 9.984-9.981 5.504 0 9.982 4.478 9.982 9.981 0 5.505-4.478 9.983-9.98 9.983z" />
                      </svg>
                      Chat WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---- Pagination Footer ---- */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          Menampilkan <strong className="text-zinc-900 dark:text-zinc-100">{filteredOrders.length === 0 ? 0 : startIndex + 1}</strong>-
          <strong className="text-zinc-900 dark:text-zinc-100">
            {Math.min(startIndex + itemsPerPage, filteredOrders.length)}
          </strong>{" "}
          dari <strong className="text-zinc-900 dark:text-zinc-100">{filteredOrders.length}</strong> total pesanan
        </div>

        <div className="flex items-center gap-1">
          <button
            suppressHydrationWarning
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Sebelumnya
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              suppressHydrationWarning
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                currentPage === page
                  ? "bg-zinc-950 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950"
                  : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            suppressHydrationWarning
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Berikutnya
          </button>
        </div>
      </div>

      {/* ---- Cetak Label Shipping Modal ---- */}
      {selectedPrintOrder && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPrintOrder(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Label Pengiriman #{selectedPrintOrder.id.slice(0, 8)}
              </h3>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setSelectedPrintOrder(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Printable Area */}
            <div className="my-4 rounded-xl border-2 border-dashed border-zinc-300 p-4 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <div className="flex justify-between items-start border-b border-zinc-300 pb-3 mb-3">
                <div>
                  <h4 className="font-black text-lg text-zinc-950 dark:text-zinc-50">BARANGINAJA</h4>
                  <p className="text-xs text-zinc-500">Resi Logistik Pengiriman Platform</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="font-bold">ID: {selectedPrintOrder.id}</p>
                  <p>{new Date(selectedPrintOrder.created_at).toLocaleDateString("id-ID")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                  <span className="font-bold text-[10px] uppercase text-zinc-400 block">PENGIRIM (SELLER):</span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedPrintOrder.product?.seller?.nama_lengkap}</p>
                  <p>{selectedPrintOrder.product?.seller?.no_hp}</p>
                  <p className="text-[11px] text-zinc-500">{selectedPrintOrder.product?.seller?.alamat_kos || "Surabaya"}</p>
                </div>
                <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                  <span className="font-bold text-[10px] uppercase text-zinc-400 block">PENERIMA (PEMBELI):</span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedPrintOrder.buyer?.nama_lengkap}</p>
                  <p>{selectedPrintOrder.buyer?.no_hp}</p>
                  <p className="text-[11px] text-zinc-500">{selectedPrintOrder.buyer?.alamat_kos || "Surabaya"}</p>
                </div>
              </div>

              <div className="p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs">
                <span className="font-bold text-[10px] uppercase text-zinc-400 block">ISl PAKET:</span>
                <p className="font-bold">{selectedPrintOrder.product?.nama_barang}</p>
                <p className="text-zinc-500 mt-1">Metode: {selectedPrintOrder.opsi_pengiriman === "kurir" ? "Kurir Instan Platform" : "COD / Ambil Sendiri"}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setSelectedPrintOrder(null)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Batal
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
              >
                Cetak Label Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
