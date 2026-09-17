import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import { formatRupiah } from "@/lib/pricing";
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  expireHoldIfNeeded,
} from "@/lib/orders";
import type { AdminOrderListItem, OrderStatus } from "@/lib/types/database";
import { AdminFilters } from "./admin-filters";

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
  "*, product:products(id, nama_barang), buyer:users!buyer_id(id, nama_lengkap, no_hp)";

function paramStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function startOfTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T00:00:00`;
}

function startOfMonthISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01T00:00:00`;
}

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

  // ---- Stat queries (parallel) ----
  const todayISO = startOfTodayISO();
  const monthISO = startOfMonthISO();

  const [
    { data: ordersData },
    { count: ordersToday },
    { count: ordersPending },
    { data: completedOrdersThisMonth },
    { count: activeProducts },
    { count: totalUsers },
    { count: totalSellers },
  ] = await Promise.all([
    // Main order list
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false }),

    // Stat: orders today
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO),

    // Stat: pending orders
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "Menunggu Pembayaran"),

    // Stat: completed orders this month (need total_harga & harga_input)
    supabase
      .from("orders")
      .select("total_harga, product:products(harga_input)")
      .eq("status", "Selesai")
      .gte("completed_at", monthISO),

    // Stat: active products
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "Tersedia"),

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

  // Platform revenue = SUM(total_harga - harga_input) for completed orders this month
  const pendapatanPlatform = (completedOrdersThisMonth ?? []).reduce(
    (sum, order) => {
      const product = order.product as unknown as
        | { harga_input: number }
        | null;
      const hargaInput = product?.harga_input ?? 0;
      return sum + (order.total_harga - hargaInput);
    },
    0
  );

  // ---- Reconcile hold timers ----
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

  const stats = [
    {
      label: "Order Hari Ini",
      value: String(ordersToday ?? 0),
      accent: "text-zinc-950 dark:text-zinc-50",
    },
    {
      label: "Menunggu Pembayaran",
      value: String(ordersPending ?? 0),
      accent: "text-amber-700 dark:text-amber-400",
    },
    {
      label: "Pendapatan Bulan Ini",
      value: formatRupiah(pendapatanPlatform),
      accent: "text-green-700 dark:text-green-400",
    },
    {
      label: "Produk Aktif",
      value: String(activeProducts ?? 0),
      accent: "text-zinc-950 dark:text-zinc-50",
    },
    {
      label: `User Terdaftar`,
      value: `${totalUsers ?? 0}`,
      sub: `${totalSellers ?? 0} penjual`,
      accent: "text-zinc-950 dark:text-zinc-50",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Dashboard Admin
      </h1>

      {/* ---- Stat Cards ---- */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>
            <p className={`mt-1 text-xl font-bold ${stat.accent}`}>
              {stat.value}
            </p>
            {stat.sub && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>

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
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
                      className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
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
