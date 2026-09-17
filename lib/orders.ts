import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus } from "@/lib/types/database";

export const HOLD_DURATION_MINUTES = 45;

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  "Menunggu Pembayaran": "Menunggu Pembayaran",
  Dibayar: "Dibayar",
  Dijemput: "Dijemput",
  "Dalam Pengiriman": "Dalam Pengiriman",
  Diterima: "Diterima",
  Selesai: "Selesai",
  Dibatalkan: "Dibatalkan",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  "Menunggu Pembayaran":
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Dibayar:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  Dijemput:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  "Dalam Pengiriman":
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  Diterima:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  Selesai:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Dibatalkan:
    "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
};

interface HoldableOrder {
  id: string;
  product_id: string;
  status: OrderStatus;
  hold_expires_at: string | null;
}

// Hold timers are not enforced by a cron job or edge function — every time an
// order/status page is opened, we check hold_expires_at against now() and
// lazily cancel the order + free up the product if the hold has lapsed.
export async function expireHoldIfNeeded<T extends HoldableOrder>(
  supabase: SupabaseClient,
  order: T
): Promise<T> {
  if (order.status !== "Menunggu Pembayaran" || !order.hold_expires_at) {
    return order;
  }

  if (new Date(order.hold_expires_at).getTime() > Date.now()) {
    return order;
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "Dibatalkan" })
    .eq("id", order.id)
    .eq("status", "Menunggu Pembayaran");

  if (orderError) {
    return order;
  }

  await supabase
    .from("products")
    .update({ status: "Tersedia" })
    .eq("id", order.product_id)
    .eq("status", "Dipesan");

  return { ...order, status: "Dibatalkan" as OrderStatus };
}

export function computeHoldExpiresAt(): string {
  return new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000).toISOString();
}

export function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const SHIPPING_PROGRESSION: OrderStatus[] = [
  "Dibayar",
  "Dijemput",
  "Dalam Pengiriman",
  "Diterima",
  "Selesai",
];

export function nextShippingStatus(status: OrderStatus): OrderStatus | null {
  const index = SHIPPING_PROGRESSION.indexOf(status);
  if (index === -1 || index === SHIPPING_PROGRESSION.length - 1) {
    return null;
  }
  return SHIPPING_PROGRESSION[index + 1];
}
