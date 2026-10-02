"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Clock, XCircle, Package, Eye, CreditCard } from "lucide-react";
import { formatRupiah } from "@/lib/pricing";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { OrderCountdownBadge } from "@/components/order-countdown-badge";
import { OrderDetailModal } from "@/components/order-detail-modal";
import type { OrderListItem, OrderStatus } from "@/lib/types/database";

const ONGOING_STATUSES: OrderStatus[] = [
  "Menunggu Pembayaran",
  "Dibayar",
  "Dijemput",
  "Dalam Pengiriman",
  "Diterima",
];

const COMPLETED_STATUSES: OrderStatus[] = ["Selesai", "Dibatalkan"];

export function BuyerOrdersList({ orders }: { orders: OrderListItem[] }) {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId");
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(() => {
    if (initialOrderId) {
      return orders.find((o) => o.id === initialOrderId) || null;
    }
    return null;
  });

  const [filter, setFilter] = useState<"semua" | "berlangsung" | "riwayat">("semua");

  const ongoingOrders = orders.filter((o) => ONGOING_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => COMPLETED_STATUSES.includes(o.status));

  const displayedOrders =
    filter === "berlangsung"
      ? ongoingOrders
      : filter === "riwayat"
      ? completedOrders
      : orders;

  const tabs = [
    { id: "semua", label: "Semua", count: orders.length },
    { id: "berlangsung", label: "Sedang Berlangsung", count: ongoingOrders.length },
    { id: "riwayat", label: "Riwayat Selesai", count: completedOrders.length },
  ] as const;

  return (
    <div>
      {/* Subtabs Filter Pembeli */}
      <div className="mb-6 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`-mb-px border-b-2 pb-3 text-sm font-normal transition-colors cursor-pointer ${
                isActive
                  ? "border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {displayedOrders.length === 0 ? (
        <div className="py-14 text-center rounded-xl border border-dashed border-zinc-200 bg-white/60 p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-sm text-zinc-500 font-normal dark:text-zinc-400">
            {filter === "semua"
              ? "Belum ada transaksi pesanan pembelian."
              : filter === "berlangsung"
              ? "Tidak ada pesanan yang sedang berlangsung."
              : "Belum ada riwayat pesanan yang selesai."}
          </p>
        </div>
      ) : (
        /* Tabel Pesanan Pembelian */
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
              {displayedOrders.map((order) => {
                const isPendingPayment = order.status === "Menunggu Pembayaran";
                const isCompleted = order.status === "Selesai";
                const isCancelled = order.status === "Dibatalkan";

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50/80 transition-colors dark:hover:bg-zinc-800/40"
                  >
                    {/* Produk: Foto + Nama + ID */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
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
                            onClick={() => setSelectedOrder(order)}
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

                    {/* Pengiriman */}
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-normal whitespace-nowrap">
                      {order.opsi_pengiriman === "cod" ? "COD (Ambil di Tempat)" : "Kurir BarangInAja"}
                    </td>

                    {/* Total Harga */}
                    <td className="px-4 py-3.5 font-normal text-zinc-950 dark:text-zinc-50 text-sm whitespace-nowrap">
                      {formatRupiah(order.total_harga)}
                    </td>

                    {/* Tanggal */}
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-normal whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
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
                        {isPendingPayment && order.hold_expires_at && (
                          <OrderCountdownBadge holdExpiresAt={order.hold_expires_at} compact />
                        )}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap text-sm font-normal">
                      <div className="flex items-center justify-center gap-2">
                        {isPendingPayment ? (
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-sm font-normal text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                          >
                            <CreditCard className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            Bayar Sekarang
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-sm font-normal text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            Lihat Detail
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail Pesanan */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
