import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import { formatRupiah, calculateHargaJual } from "@/lib/pricing";
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  expireHoldIfNeeded,
} from "@/lib/orders";
import type { AdminOrderListItem, OrderStatus } from "@/lib/types/database";
import { AdminFilters } from "./admin-filters";
import { DashboardProfitChart, DashboardOrderProfitData } from "./dashboard-profit-chart";

const ORDER_STATUSES: OrderStatus[] = [
  "Menunggu Pembayaran",
  "Dibayar",
  "Dijemput",
  "Dalam Pengiriman",
  "Diterima",
  "Selesai",
  "Dibatalkan",
];

const ORDER_SELECT =
  "*, product:products(id, nama_barang, harga_input, harga_jual), buyer:users!buyer_id(id, nama_lengkap, no_hp)";

function paramStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

import { AdminPageHeader } from "./admin-page-header";

export default async function AdminDashboardPage({
  searchParams,
}: PageProps<"/admin">) {
  const params = await searchParams;
  const supabase = await createClient();
  await requireAdmin(supabase, "/admin");

  const statusParam = paramStr(params.status);
  const status: OrderStatus | "" = ORDER_STATUSES.includes(
    statusParam as OrderStatus
  )
    ? (statusParam as OrderStatus)
    : "";
  const search = paramStr(params.q).toLowerCase();

  // Parallel Queries
  const [
    { data: ordersData },
    { count: ordersPending },
    { data: completedOrdersData },
    { data: pendingPayoutsData },
    { count: totalUsers },
    { count: totalSellers },
  ] = await Promise.all([
    // Main order list
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false }),

    // Stat: pending orders (Menunggu Pembayaran)
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "Menunggu Pembayaran"),

    // Stat: completed orders all time (need total_harga, ongkir, opsi_pengiriman, product:harga_input, harga_jual)
    supabase
      .from("orders")
      .select("id, status, created_at, completed_at, total_harga, ongkir, opsi_pengiriman, product:products(harga_input, harga_jual)")
      .eq("status", "Selesai"),

    // Stat: pending payouts
    supabase
      .from("payouts")
      .select("id, nominal, status")
      .eq("status", "menunggu"),

    // Stat: total users
    supabase
      .from("users")
      .select("*", { count: "exact", head: true }),

    // Stat: total sellers
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_seller", true),
  ]);

  const completedOrders = (completedOrdersData as unknown as DashboardOrderProfitData[]) ?? [];

  // Profit Calculations for Top Card 1
  let totalMarkupProfit = 0;
  let totalOngkirProfit = 0;

  completedOrders.forEach((order) => {
    const hargaInput = order.product?.harga_input ?? 0;
    const hargaJual =
      order.product?.harga_jual ?? calculateHargaJual(hargaInput).hargaJual;
    const markup = Math.max(0, hargaJual - hargaInput);
    const ongkir = order.opsi_pengiriman === "kurir" ? order.ongkir ?? 0 : 0;

    totalMarkupProfit += markup;
    totalOngkirProfit += ongkir;
  });

  const totalPlatformProfit = totalMarkupProfit + totalOngkirProfit;

  // Payout Stats
  const pendingPayouts = pendingPayoutsData ?? [];
  const pendingPayoutCount = pendingPayouts.length;
  const pendingPayoutNominal = pendingPayouts.reduce((sum, p) => sum + (p.nominal ?? 0), 0);

  // Reconcile hold timers for table display
  const reconciled = await Promise.all(
    ((ordersData as AdminOrderListItem[]) ?? []).map((order) =>
      expireHoldIfNeeded(supabase, order)
    )
  );

  const statusFiltered = status
    ? reconciled.filter((order) => order.status === status)
    : reconciled;

  const orders = search
    ? statusFiltered.filter((order) => {
        const namaBarang = order.product?.nama_barang?.toLowerCase() ?? "";
        const namaBuyer = order.buyer?.nama_lengkap?.toLowerCase() ?? "";
        return namaBarang.includes(search) || namaBuyer.includes(search);
      })
    : statusFiltered;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      <AdminPageHeader
        title="Dashboard Admin"
        subtitle="Ringkasan performa platform, statistik keuangan, dan transaksi terbaru"
      />

      {/* ---- Top 4 Metric Cards ---- */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: KEUNTUNGAN PLATFORM */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              KEUNTUNGAN PLATFORM
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-sm shadow-xs">
              $
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {formatRupiah(totalPlatformProfit)}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
            MARKUP ({formatRupiah(totalMarkupProfit)}) + ONGKIR ({formatRupiah(totalOngkirProfit)})
          </p>
        </div>

        {/* Card 2: PESANAN PENDING WA */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              PESANAN PENDING WA
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {ordersPending ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
            PERLU KONFIRMASI WA (HOLD 5 MNT)
          </p>
        </div>

        {/* Card 3: DAFTAR PAYOUT SELLER */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              DAFTAR PAYOUT SELLER
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {pendingPayoutCount}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
            PENDING: {formatRupiah(pendingPayoutNominal)}
          </p>
        </div>

        {/* Card 4: TOTAL SELLER */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              TOTAL SELLER
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            {totalSellers ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
            DARI TOTAL {totalUsers ?? 0} MAHASISWA
          </p>
        </div>
      </div>

      {/* ---- Grafik Tren Keuntungan Platform Component ---- */}
      <DashboardProfitChart completedOrders={completedOrders} />

      {/* ---- Existing Order Table ---- */}
      <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
        Semua Order
      </h2>

      <AdminFilters />

      {orders.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Tidak ada order ditemukan.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
              <tr>
                <th className="px-4 py-3">ID Order</th>
                <th className="px-4 py-3">Barang</th>
                <th className="px-4 py-3">Pembeli</th>
                <th className="px-4 py-3">Pengiriman</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 font-mono">
                    <Link
                      href={`/admin/order/${order.id}`}
                      className="font-semibold text-zinc-950 hover:underline dark:text-zinc-50"
                    >
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {order.product?.nama_barang ?? "Produk dihapus"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {order.buyer?.nama_lengkap ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {order.opsi_pengiriman === "cod"
                      ? "COD / Ambil Sendiri"
                      : "Kurir Platform"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {formatRupiah(order.total_harga)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[order.status]}`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {new Date(order.created_at).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
