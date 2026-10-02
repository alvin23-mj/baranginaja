"use client";

import { useEffect } from "react";
import { Check, Clock, Package, XCircle, X, MessageCircle, ExternalLink } from "lucide-react";
import { formatRupiah } from "@/lib/pricing";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { OrderCountdownBadge } from "@/components/order-countdown-badge";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import type { OrderListItem } from "@/lib/types/database";

interface OrderDetailModalProps {
  order: OrderListItem | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (order) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [order, onClose]);

  if (!order) return null;

  const product = order.product;
  const isPendingPayment = order.status === "Menunggu Pembayaran";
  const isCompleted = order.status === "Selesai";
  const isCancelled = order.status === "Dibatalkan";

  const waLink =
    isPendingPayment && product?.seller?.no_hp
      ? buildOrderWhatsAppLink({
          sellerPhone: product.seller.no_hp,
          namaBarang: product.nama_barang,
          productId: product.id,
          namaPenjual: product.seller.nama_lengkap,
          opsiPengiriman: order.opsi_pengiriman,
          totalHarga: order.total_harga,
          orderId: order.id,
        })
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto z-10 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-order-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 id="modal-order-title" className="text-lg font-normal text-zinc-950 dark:text-zinc-50">
              Detail Pesanan
            </h3>
            <p className="text-sm font-normal text-zinc-500 dark:text-zinc-400 mt-0.5">
              Order #{order.id.slice(0, 8)} •{" "}
              {new Date(order.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Tutup detail pesanan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Badge & Countdown */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400">
              Status:
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-normal ${
                isPendingPayment
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : isCompleted
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : isCancelled
                  ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 line-through"
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
          </div>

          {isPendingPayment && order.hold_expires_at && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Batas Bayar:</span>
              <OrderCountdownBadge holdExpiresAt={order.hold_expires_at} compact />
            </div>
          )}
        </div>

        {/* Informasi Produk */}
        <div className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 dark:bg-zinc-800">
            {product?.foto_urls?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.foto_urls[0]}
                alt={product.nama_barang}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                No foto
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-normal text-zinc-950 dark:text-zinc-50 truncate" title={product?.nama_barang}>
              {product?.nama_barang ?? "Produk telah dihapus"}
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Opsi: {order.opsi_pengiriman === "cod" ? "COD (Ambil di Tempat)" : "Kurir BarangInAja"}
            </p>
            <p className="text-sm font-normal text-zinc-950 dark:text-zinc-50 mt-1">
              {formatRupiah(order.total_harga - (order.ongkir ?? 0))}
            </p>
          </div>
        </div>

        {/* Info Pengiriman & Penjual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Box Pengiriman */}
          <div className="rounded-xl border border-zinc-200 p-3.5 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30 space-y-1.5">
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 block">
              Pengiriman
            </span>
            <p className="text-sm font-normal text-zinc-900 dark:text-zinc-100">
              {order.opsi_pengiriman === "cod" ? "COD / Ambil Sendiri" : "Kurir Platform"}
            </p>
            {order.opsi_pengiriman === "kurir" && order.jarak_km != null && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Jarak: {order.jarak_km.toFixed(1)} km • Berat: {product?.berat_kg ?? 1} kg
              </p>
            )}
          </div>

          {/* Box Penjual */}
          <div className="rounded-xl border border-zinc-200 p-3.5 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30 space-y-1.5">
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 block">
              Penjual
            </span>
            <p className="text-sm font-normal text-zinc-900 dark:text-zinc-100">
              {product?.seller?.nama_lengkap ?? "Penjual Mahasiswa"}
            </p>
            {product?.seller?.no_hp && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                Telp/WA: {product.seller.no_hp}
              </p>
            )}
          </div>
        </div>

        {/* Rincian Biaya */}
        <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30 space-y-2 text-sm">
          <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 block mb-1">
            Rincian Pembayaran
          </span>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-normal">
            <span>Harga Produk</span>
            <span>{formatRupiah(order.total_harga - (order.ongkir ?? 0))}</span>
          </div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-normal">
            <span>Ongkos Kirim</span>
            <span>{order.ongkir ? formatRupiah(order.ongkir) : "Gratis (COD)"}</span>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between text-zinc-950 dark:text-zinc-50 font-normal">
            <span>Total Pembayaran</span>
            <span className="font-normal text-base text-zinc-950 dark:text-zinc-50">
              {formatRupiah(order.total_harga)}
            </span>
          </div>
        </div>

        {/* Informasi Pembatalan jika Dibatalkan */}
        {isCancelled && (
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            Waktu pembayaran telah habis, pesanan ini otomatis dibatalkan dan produk telah dikembalikan ke listing.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          {isPendingPayment && waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-normal text-white hover:bg-emerald-700 transition-colors shadow-xs flex-1 text-center"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>Konfirmasi via WhatsApp</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-normal text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors flex-1"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
