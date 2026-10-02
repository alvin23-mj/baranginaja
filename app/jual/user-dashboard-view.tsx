"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Clock, CheckCircle2, XCircle, Package, Eye } from "lucide-react";
import { formatRupiah } from "@/lib/pricing";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { PAYOUT_STATUS_LABEL } from "@/lib/payouts";
import { UserPageHeader } from "./user-page-header";
import { ProductList } from "./product-list";
import { BuyerOrdersList } from "./buyer-orders-list";
import { PendapatanView } from "./pendapatan-view";
import { OrderDetailModal } from "@/components/order-detail-modal";
import type {
  ProductWithCategory,
  OrderListItem,
  SellerPayoutListItem,
} from "@/lib/types/database";

interface UserDashboardViewProps {
  isSeller: boolean;
  userName: string;
  products: ProductWithCategory[];
  buyerOrders: OrderListItem[];
  payouts: SellerPayoutListItem[];
  bankInfo?: {
    namaBank: string | null;
    noRekening: string | null;
    namaPemilik: string | null;
  } | null;
  districtName: string | null;
}

export function CardSparkline({
  data,
  color,
  id,
}: {
  data: number[];
  color: "blue" | "amber" | "emerald" | "purple";
  id: string;
}) {
  const width = 120;
  const height = 36;
  const padding = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y =
      max === min
        ? height / 2
        : height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y };
  });

  let pathD = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaD = `${pathD} L ${lastPoint.x.toFixed(1)},${height} L ${firstPoint.x.toFixed(1)},${height} Z`;

  const colorConfig = {
    blue: {
      stroke: "#2563eb",
      stop: "#3b82f6",
    },
    amber: {
      stroke: "#d97706",
      stop: "#f59e0b",
    },
    emerald: {
      stroke: "#059669",
      stop: "#10b981",
    },
    purple: {
      stroke: "#7c3aed",
      stop: "#8b5cf6",
    },
  };

  const c = colorConfig[color];

  return (
    <div className="w-full h-8 overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.stop} stopOpacity="0.25" />
            <stop offset="100%" stopColor={c.stop} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#spark-${id})`} />
        <path
          d={pathD}
          fill="none"
          stroke={c.stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2.5"
          fill={c.stroke}
        />
      </svg>
    </div>
  );
}

export function UserDashboardView({
  isSeller,
  userName,
  products,
  buyerOrders,
  payouts,
  bankInfo,
  districtName,
}: UserDashboardViewProps) {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";
  const [dashboardTab, setDashboardTab] = useState<"semua" | "penjual" | "pembeli" | "pendapatan">("semua");
  const [selectedBuyerOrder, setSelectedBuyerOrder] = useState<OrderListItem | null>(null);

  // Render Penjual View
  if (currentView === "penjual") {
    return (
      <div className="w-full flex flex-col min-h-screen">
        <UserPageHeader
          title="Kelola Penjualan"
          subtitle="Kelola produk yang kamu jual. Kamu dapat mengedit nama atau detail produk selama barang belum terjual."
        />

        <div className="w-full px-4 sm:px-6 md:px-8 py-6 flex-1">
          {!isSeller ? (
            <div className="py-14 text-center rounded-2xl border border-dashed border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                Mode Penjual Belum Aktif
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Lengkapi informasi tokomu di profil untuk mulai menjual barang ke sesama mahasiswa di Surabaya.
              </p>
              <Link
                href="/profil"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                Buka Profil & Aktifkan Penjual
              </Link>
            </div>
          ) : (
            <ProductList products={products} districtName={districtName} />
          )}
        </div>
      </div>
    );
  }

  // Render Pembeli View
  if (currentView === "pembeli") {
    return (
      <div className="w-full flex flex-col min-h-screen">
        <UserPageHeader
          title="Pesanan Pembelian"
          subtitle="Pantau pesanan yang sedang berjalan, lakukan pembayaran, atau lihat riwayat belanjamu."
        />

        <div className="w-full px-4 sm:px-6 md:px-8 py-6 flex-1">
          <BuyerOrdersList orders={buyerOrders} />
        </div>
      </div>
    );
  }

  // Render Pendapatan View
  if (currentView === "pendapatan") {
    return (
      <div className="w-full flex flex-col min-h-screen">
        <UserPageHeader
          title="Pendapatan Saya"
          subtitle="Pantau saldo hasil penjualan tokomu dan riwayat pencairan dana ke rekeningmu."
        />

        <div className="w-full px-4 sm:px-6 md:px-8 py-6 flex-1">
          {!isSeller ? (
            <div className="py-14 text-center rounded-2xl border border-dashed border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                Mode Penjual Belum Aktif
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Fitur riwayat pendapatan dan pencairan dana hanya tersedia untuk akun penjual. Aktifkan akun penjual melalui profil Anda.
              </p>
              <Link
                href="/profil"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                Buka Profil & Aktifkan Penjual
              </Link>
            </div>
          ) : (
            <PendapatanView payouts={payouts} bankInfo={bankInfo} />
          )}
        </div>
      </div>
    );
  }

  // Default: Dashboard Overview dengan Ucapan Selamat Datang
  const totalDiterima = payouts
    .filter((p) => p.status === "dicairkan")
    .reduce((sum, p) => sum + p.nominal, 0);

  const totalMenunggu = payouts
    .filter((p) => p.status === "menunggu")
    .reduce((sum, p) => sum + p.nominal, 0);

  const pendingBuyerOrders = buyerOrders.filter(
    (o) => o.status === "Menunggu Pembayaran"
  );
  const activeProducts = products.filter((p) => p.status === "Tersedia");

  return (
    <div className="w-full flex flex-col min-h-screen">
      <UserPageHeader
        title="Dashboard"
        subtitle="Ringkasan aktivitas jual beli dan status akun kamu di BaranginAja."
      />

      <div className="w-full px-4 sm:px-6 md:px-8 py-6 space-y-6 flex-1">
        {/* Hero Welcome Section (Tanpa Card) */}
        <div className="space-y-3 max-w-3xl pt-1 pb-2">
          <h2
            className="text-[34px] sm:text-[44px] tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.2]"
            style={{
              fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
              fontWeight: 300,
            }}
          >
            Halo, {userName}!
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-[1.8]">
            Selamat datang di dashboard personal BaranginAja. Di sini kamu bisa memantau produk yang sedang kamu jual, melacak status pesanan belanjaanmu, serta mengecek pencairan pendapatan langsung ke rekeningmu.
          </p>
        </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Produk Jualan */}
        <Link
          href="/jual?view=penjual"
          className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition-all dark:bg-zinc-900 block"
        >
          {/* Large partially-visible watermark icon */}
          <div className="absolute -top-3 -right-3 text-zinc-400 opacity-50 dark:text-zinc-600 pointer-events-none">
            <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.614A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.015a2.993 2.993 0 0 0 2.25 1.015c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0L5.27 4.148A2.25 2.25 0 0 1 7.28 3h9.44a2.25 2.25 0 0 1 2.01 1.148l1.52 5.201" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Produk Dijual
            </span>
          </div>
          <p className="relative z-10 mt-2 text-2xl font-normal text-zinc-950 dark:text-zinc-50">
            {products.length} Barang
          </p>
          <div className="relative z-10 mt-3">
            <CardSparkline
              id="chart-produk"
              color="blue"
              data={[1, 1, 2, 2, 3, 2, Math.max(products.length, 2)]}
            />
          </div>
        </Link>

        {/* Card 2: Pesanan Pembelian */}
        <Link
          href="/jual?view=pembeli"
          className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition-all dark:bg-zinc-900 block"
        >
          {/* Large partially-visible watermark icon */}
          <div className="absolute -top-3 -right-3 text-zinc-400 opacity-50 dark:text-zinc-600 pointer-events-none">
            <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Pesanan Pembelian
            </span>
          </div>
          <p className="relative z-10 mt-2 text-2xl font-normal text-zinc-950 dark:text-zinc-50">
            {buyerOrders.length} Pesanan
          </p>
          <div className="relative z-10 mt-3">
            <CardSparkline
              id="chart-pesanan"
              color="amber"
              data={[0, 1, 0, 2, 1, 1, Math.max(buyerOrders.length, 0)]}
            />
          </div>
        </Link>

        {/* Card 3: Saldo Dicairkan */}
        <Link
          href="/jual?view=pendapatan"
          className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition-all dark:bg-zinc-900 block"
        >
          {/* Large partially-visible watermark icon */}
          <div className="absolute -top-3 -right-3 text-zinc-400 opacity-50 dark:text-zinc-600 pointer-events-none">
            <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Total Pendapatan
            </span>
          </div>
          <p className="relative z-10 mt-2 text-2xl font-normal text-zinc-950 dark:text-zinc-50">
            {formatRupiah(totalDiterima)}
          </p>
          <div className="relative z-10 mt-3">
            <CardSparkline
              id="chart-pendapatan"
              color="emerald"
              data={[150000, 300000, 250000, 600000, 500000, 850000, Math.max(totalDiterima, 1000000)]}
            />
          </div>
        </Link>

        {/* Card 4: Wilayah / Status Akun */}
        <Link
          href="/profil"
          className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition-all dark:bg-zinc-900 block"
        >
          {/* Large partially-visible watermark icon */}
          <div className="absolute -top-3 -right-3 text-zinc-400 opacity-50 dark:text-zinc-600 pointer-events-none">
            <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Domisili & Profil
            </span>
          </div>
          <p className="relative z-10 mt-2 text-xl font-normal text-zinc-950 dark:text-zinc-50 truncate">
            {districtName ? `Kec. ${districtName}` : "Surabaya"}
          </p>
          <div className="relative z-10 mt-3">
            <CardSparkline
              id="chart-profil"
              color="purple"
              data={[3, 5, 4, 7, 6, 8, 9]}
            />
          </div>
        </Link>
      </div>

      {/* Subtabs Filter Ringkasan */}
      <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800 pt-2">
        <button
          type="button"
          onClick={() => setDashboardTab("semua")}
          className={`-mb-px border-b-2 pb-3 text-sm font-normal transition-colors cursor-pointer ${
            dashboardTab === "semua"
              ? "border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Semua Ringkasan
        </button>
        <button
          type="button"
          onClick={() => setDashboardTab("penjual")}
          className={`-mb-px border-b-2 pb-3 text-sm font-normal transition-colors cursor-pointer ${
            dashboardTab === "penjual"
              ? "border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Produk Penjual ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setDashboardTab("pembeli")}
          className={`-mb-px border-b-2 pb-3 text-sm font-normal transition-colors cursor-pointer ${
            dashboardTab === "pembeli"
              ? "border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Pesanan Pembeli ({buyerOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setDashboardTab("pendapatan")}
          className={`-mb-px border-b-2 pb-3 text-sm font-normal transition-colors cursor-pointer ${
            dashboardTab === "pendapatan"
              ? "border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Riwayat Pendapatan ({payouts.length})
        </button>
      </div>

      {/* Section 1: Produk Penjualan (Hanya Tampilan) */}
      {(dashboardTab === "semua" || dashboardTab === "penjual") && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between p-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-normal text-zinc-950 dark:text-zinc-50">
                Produk Penjualan
              </h3>
              <span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal">
                ({products.length})
              </span>
            </div>
            <Link
              href="/jual?view=penjual"
              className="text-sm font-normal text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Kelola di Penjual
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="py-8 text-center text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Belum ada produk yang kamu daftarkan untuk dijual.
            </div>
          ) : (
            <table className="w-full text-left text-sm font-normal">
              <thead className="border-b border-zinc-200 bg-zinc-50/75 text-sm font-normal text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3.5 font-normal">Produk</th>
                  <th className="px-4 py-3.5 font-normal">Kategori</th>
                  <th className="px-4 py-3.5 font-normal">Harga Jual</th>
                  <th className="px-4 py-3.5 font-normal">Status</th>
                  <th className="px-4 py-3.5 font-normal">Lokasi</th>
                  <th className="px-5 py-3.5 text-center font-normal">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {products.slice(0, 5).map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50/80 transition-colors dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <Link
                          href={`/produk/${product.id}`}
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 block group"
                        >
                          {product.foto_urls[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.foto_urls[0]}
                              alt={product.nama_barang}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                              No foto
                            </div>
                          )}
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/produk/${product.id}`}
                            className="font-normal text-zinc-950 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400 truncate block transition-colors max-w-xs text-sm"
                            title={product.nama_barang}
                          >
                            {product.nama_barang}
                          </Link>
                          <span className="text-sm text-zinc-400 dark:text-zinc-500">
                            ID: {product.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-normal whitespace-nowrap">
                      {product.kategori?.nama_kategori || "-"}
                    </td>
                    <td className="px-4 py-3.5 font-normal text-zinc-950 dark:text-zinc-50 text-sm whitespace-nowrap">
                      {formatRupiah(product.harga_jual)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-normal ${
                          product.status === "Terjual"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : product.status === "Dipesan"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                        }`}
                      >
                        {product.status === "Terjual" ? (
                          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                        ) : product.status === "Dipesan" ? (
                          <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                        )}
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-normal whitespace-nowrap">
                      {districtName ? `Kec. ${districtName}` : "Surabaya"}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap text-sm font-normal">
                      <Link
                        href={`/produk/${product.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-sm font-normal text-white hover:bg-blue-700 transition-colors shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Section 2: Pesanan Pembelian (Hanya Tampilan) */}
      {(dashboardTab === "semua" || dashboardTab === "pembeli") && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between p-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-normal text-zinc-950 dark:text-zinc-50">
                Pesanan Pembelian
              </h3>
              <span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal">
                ({buyerOrders.length})
              </span>
            </div>
            <Link
              href="/jual?view=pembeli"
              className="text-sm font-normal text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Lihat Semua di Pembeli
            </Link>
          </div>

          {buyerOrders.length === 0 ? (
            <div className="py-8 text-center text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Belum ada transaksi pesanan pembelian.
            </div>
          ) : (
            <table className="w-full text-left text-sm font-normal">
              <thead className="border-b border-zinc-200 bg-zinc-50/75 text-sm font-normal text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3.5 font-normal">Produk</th>
                  <th className="px-4 py-3.5 font-normal">Pengiriman</th>
                  <th className="px-4 py-3.5 font-normal">Total Harga</th>
                  <th className="px-4 py-3.5 font-normal">Tanggal</th>
                  <th className="px-4 py-3.5 font-normal">Status</th>
                  <th className="px-5 py-3.5 text-center font-normal">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {buyerOrders.slice(0, 5).map((order) => {
                  const isPendingPayment = order.status === "Menunggu Pembayaran";
                  const isCompleted = order.status === "Selesai";
                  const isCancelled = order.status === "Dibatalkan";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/80 transition-colors dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBuyerOrder(order)}
                            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 block group cursor-pointer text-left"
                          >
                            {order.product?.foto_urls?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={order.product.foto_urls[0]}
                                alt={order.product.nama_barang}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                                No foto
                              </div>
                            )}
                          </button>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedBuyerOrder(order)}
                              className="font-normal text-zinc-950 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400 truncate block transition-colors max-w-xs text-sm text-left cursor-pointer"
                              title={order.product?.nama_barang ?? "Produk"}
                            >
                              {order.product?.nama_barang ?? "Produk telah dihapus"}
                            </button>
                            <span className="text-sm text-zinc-400 dark:text-zinc-500">
                              Order #{order.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-normal whitespace-nowrap">
                        {order.opsi_pengiriman === "cod" ? "COD (Ambil di Tempat)" : "Kurir BarangInAja"}
                      </td>
                      <td className="px-4 py-3.5 font-normal text-zinc-950 dark:text-zinc-50 text-sm whitespace-nowrap">
                        {formatRupiah(order.total_harga)}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-normal whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-normal ${
                            isPendingPayment
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : isCompleted
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : isCancelled
                              ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 line-through"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}
                        >
                          {isPendingPayment ? (
                            <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                          ) : isCompleted ? (
                            <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                          ) : isCancelled ? (
                            <XCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                          ) : (
                            <Package className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                          )}
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap text-sm font-normal">
                        <button
                          type="button"
                          onClick={() => setSelectedBuyerOrder(order)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-sm font-normal text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Section 3: Riwayat Pendapatan (Hanya Tampilan) */}
      {(dashboardTab === "semua" || dashboardTab === "pendapatan") && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between p-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-normal text-zinc-950 dark:text-zinc-50">
                Riwayat Pendapatan
              </h3>
              <span className="text-sm text-zinc-400 dark:text-zinc-500 font-normal">
                ({payouts.length})
              </span>
            </div>
            <Link
              href="/jual?view=pendapatan"
              className="text-sm font-normal text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Lihat Semua di Pendapatan
            </Link>
          </div>

          {payouts.length === 0 ? (
            <div className="py-8 text-center text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Belum ada riwayat pencairan dana penjualan.
            </div>
          ) : (
            <table className="w-full text-left text-sm font-normal">
              <thead className="border-b border-zinc-200 bg-zinc-50/75 text-sm font-normal text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3.5 font-normal">ID Payout</th>
                  <th className="px-4 py-3.5 font-normal">Produk</th>
                  <th className="px-4 py-3.5 font-normal">Nominal</th>
                  <th className="px-4 py-3.5 font-normal">Status</th>
                  <th className="px-5 py-3.5 font-normal">Tanggal Dicairkan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {payouts.slice(0, 5).map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50/80 transition-colors dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-3.5 font-mono text-zinc-600 dark:text-zinc-400">
                      #{p.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3.5 font-normal text-zinc-900 dark:text-zinc-100">
                      {p.order?.product?.nama_barang ?? "Produk transaksi"}
                    </td>
                    <td className="px-4 py-3.5 font-normal text-zinc-950 dark:text-zinc-50">
                      {formatRupiah(p.nominal)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-normal ${
                          p.status === "dicairkan"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {p.status === "dicairkan" ? (
                          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                        ) : (
                          <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                        )}
                        {PAYOUT_STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {p.tanggal_dicairkan
                        ? new Date(p.tanggal_dicairkan).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      </div>

      {/* Modal Detail Pesanan */}
      <OrderDetailModal
        order={selectedBuyerOrder}
        onClose={() => setSelectedBuyerOrder(null)}
      />
    </div>
  );
}
