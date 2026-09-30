"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BUKTI_PEMBAYARAN_BUCKET,
  isValidBuktiBayarFile,
} from "@/lib/supabase/storage";
import { ORDER_STATUS_LABEL, nextShippingStatus } from "@/lib/orders";
import { createPayoutIfNeeded } from "@/lib/payouts";
import type { AdminOrderDetail } from "@/lib/types/database";
import { Toast } from "@/components/toast";

function extensionForMime(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

type BuktiMode = "upload" | "manual";

export function AdminOrderActions({
  order,
  adminId,
}: {
  order: AdminOrderDetail;
  adminId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [buktiMode, setBuktiMode] = useState<BuktiMode>("manual");
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [catatan, setCatatan] = useState("");

  const canKonfirmasiPembayaran = order.status === "Menunggu Pembayaran";
  const nextShipping =
    order.opsi_pengiriman === "kurir" ? nextShippingStatus(order.status) : null;
  const canBatalkan =
    order.status === "Menunggu Pembayaran" || order.status === "Dibayar";

  async function logActivity(aksi: string, timestamp: string) {
    const supabase = createClient();
    await supabase.from("activity_logs").insert({
      admin_id: adminId,
      order_id: order.id,
      aksi,
      timestamp,
    });
  }

  async function handleKonfirmasiPembayaran() {
    setErrorMessage(null);

    if (buktiMode === "upload" && !buktiFile) {
      setErrorMessage("Pilih file bukti pembayaran.");
      return;
    }
    if (buktiMode === "manual" && !catatan.trim()) {
      setErrorMessage("Isi catatan konfirmasi pembayaran.");
      return;
    }
    if (buktiMode === "upload" && buktiFile && !isValidBuktiBayarFile(buktiFile)) {
      setErrorMessage("File harus JPG/PNG/WEBP dan berukuran maksimal 5MB.");
      return;
    }

    if (
      !window.confirm(
        "Konfirmasi bahwa pembayaran untuk order ini sudah diterima?"
      )
    ) {
      return;
    }

    setLoading(true);
    const supabase = createClient();

    let buktiBayarUrl: string;
    if (buktiMode === "upload" && buktiFile) {
      const path = `${order.id}/${crypto.randomUUID()}.${extensionForMime(buktiFile.type)}`;
      const { error: uploadError } = await supabase.storage
        .from(BUKTI_PEMBAYARAN_BUCKET)
        .upload(path, buktiFile);

      if (uploadError) {
        setLoading(false);
        setToastMessage(`Gagal mengunggah bukti: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUKTI_PEMBAYARAN_BUCKET)
        .getPublicUrl(path);
      buktiBayarUrl = publicUrlData.publicUrl;
    } else {
      buktiBayarUrl = catatan.trim();
    }

    const now = new Date().toISOString();
    const isCod = order.opsi_pengiriman === "cod";

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: isCod ? "Selesai" : "Dibayar",
        paid_at: now,
        admin_id: adminId,
        bukti_bayar_url: buktiBayarUrl,
        ...(isCod ? { completed_at: now } : {}),
      })
      .eq("id", order.id)
      .eq("status", "Menunggu Pembayaran");

    if (orderError) {
      setLoading(false);
      setToastMessage(`Gagal mengonfirmasi pembayaran: ${orderError.message}`);
      return;
    }

    let payoutError: string | null = null;

    if (isCod) {
      await supabase
        .from("products")
        .update({ status: "Terjual" })
        .eq("id", order.product_id)
        .eq("status", "Dipesan");

      if (order.product?.seller?.id) {
        const result = await createPayoutIfNeeded(supabase, {
          orderId: order.id,
          sellerId: order.product.seller.id,
          nominal: order.product.harga_input,
        });
        payoutError = result.error;
        if (payoutError) {
          console.error("Gagal membuat payout:", payoutError);
        }
      } else {
        payoutError = "data penjual/produk tidak lengkap";
      }
    }

    await logActivity("Konfirmasi Pembayaran", now);

    setLoading(false);
    setToastMessage(
      payoutError
        ? `Pembayaran dikonfirmasi, tapi gagal membuat payout: ${payoutError}`
        : "Pembayaran berhasil dikonfirmasi."
    );
    router.refresh();
  }

  async function handleLanjutkanPengiriman() {
    if (!nextShipping) return;

    if (
      !window.confirm(
        `Update status pengiriman menjadi "${ORDER_STATUS_LABEL[nextShipping]}"?`
      )
    ) {
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    const supabase = createClient();
    const now = new Date().toISOString();

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: nextShipping,
        ...(nextShipping === "Selesai" ? { completed_at: now } : {}),
      })
      .eq("id", order.id)
      .eq("status", order.status);

    if (orderError) {
      setLoading(false);
      setToastMessage(`Gagal memperbarui status: ${orderError.message}`);
      return;
    }

    let payoutError: string | null = null;

    if (nextShipping === "Selesai") {
      await supabase
        .from("products")
        .update({ status: "Terjual" })
        .eq("id", order.product_id)
        .eq("status", "Dipesan");

      if (order.product?.seller?.id) {
        const result = await createPayoutIfNeeded(supabase, {
          orderId: order.id,
          sellerId: order.product.seller.id,
          nominal: order.product.harga_input,
        });
        payoutError = result.error;
        if (payoutError) {
          console.error("Gagal membuat payout:", payoutError);
        }
      } else {
        payoutError = "data penjual/produk tidak lengkap";
      }
    }

    await logActivity(`Update Status Pengiriman ke ${nextShipping}`, now);

    setLoading(false);
    setToastMessage(
      payoutError
        ? `Status pengiriman diperbarui, tapi gagal membuat payout: ${payoutError}`
        : "Status pengiriman berhasil diperbarui."
    );
    router.refresh();
  }

  async function handleBatalkan() {
    if (!window.confirm("Batalkan order ini?")) {
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    const supabase = createClient();
    const now = new Date().toISOString();

    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "Dibatalkan" })
      .eq("id", order.id)
      .eq("status", order.status);

    if (orderError) {
      setLoading(false);
      setToastMessage(`Gagal membatalkan order: ${orderError.message}`);
      return;
    }

    await supabase
      .from("products")
      .update({ status: "Tersedia" })
      .eq("id", order.product_id)
      .eq("status", "Dipesan");

    await logActivity("Batalkan Order oleh Admin", now);

    setLoading(false);
    setToastMessage("Order berhasil dibatalkan.");
    router.refresh();
  }

  if (!canKonfirmasiPembayaran && !nextShipping && !canBatalkan) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <p className="font-medium text-zinc-950 dark:text-zinc-50">Aksi Admin</p>

      {canKonfirmasiPembayaran && (
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
            Konfirmasi Pembayaran Diterima
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBuktiMode("manual")}
              className={`h-9 flex-1 rounded-md border text-sm font-medium transition-colors ${
                buktiMode === "manual"
                  ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              Catatan Manual
            </button>
            <button
              type="button"
              onClick={() => setBuktiMode("upload")}
              className={`h-9 flex-1 rounded-md border text-sm font-medium transition-colors ${
                buktiMode === "upload"
                  ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              Upload Bukti
            </button>
          </div>

          {buktiMode === "manual" ? (
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan konfirmasi manual (misal: sudah dikonfirmasi via WhatsApp)"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            />
          ) : (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setBuktiFile(e.target.files?.[0] ?? null)}
              className="text-sm text-zinc-700 dark:text-zinc-300"
            />
          )}

          <button
            type="button"
            onClick={handleKonfirmasiPembayaran}
            disabled={loading}
            className="h-10 w-full rounded-md bg-zinc-950 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Konfirmasi Pembayaran Diterima"}
          </button>
        </div>
      )}

      {nextShipping && (
        <button
          type="button"
          onClick={handleLanjutkanPengiriman}
          disabled={loading}
          className="h-10 w-full rounded-md bg-zinc-950 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-60"
        >
          {loading
            ? "Memproses..."
            : `Lanjutkan ke "${ORDER_STATUS_LABEL[nextShipping]}"`}
        </button>
      )}

      {canBatalkan && (
        <button
          type="button"
          onClick={handleBatalkan}
          disabled={loading}
          className="h-10 w-full rounded-md border border-zinc-400 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {loading ? "Memproses..." : "Batalkan Order"}
        </button>
      )}

      {errorMessage && (
        <p className="text-xs font-semibold text-zinc-950 dark:text-zinc-50">{errorMessage}</p>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </div>
  );
}
