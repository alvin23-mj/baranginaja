import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus } from "@/lib/types/database";

export const HOLD_DURATION_MINUTES = 10;

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
    "bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700",
  Dibayar:
    "bg-zinc-900 text-zinc-50 border border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100",
  Dijemput:
    "bg-zinc-800 text-zinc-100 border border-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200",
  "Dalam Pengiriman":
    "bg-zinc-800 text-zinc-100 border border-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200",
  Diterima:
    "bg-zinc-800 text-zinc-100 border border-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200",
  Selesai:
    "bg-zinc-950 text-white border border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold",
  Dibatalkan:
    "bg-zinc-100 text-zinc-500 border border-zinc-300 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800 line-through",
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

// Bulk reconciliation: find all orders in "Menunggu Pembayaran" whose hold_expires_at has passed,
// cancel them and return their products to "Tersedia".
export async function expireAllLapsedHolds(
  supabase: SupabaseClient
): Promise<{ expiredCount: number; error: string | null }> {
  const now = new Date().toISOString();

  const { data: expiredOrders, error: fetchError } = await supabase
    .from("orders")
    .select("id, product_id")
    .eq("status", "Menunggu Pembayaran")
    .lte("hold_expires_at", now);

  if (fetchError) {
    return { expiredCount: 0, error: fetchError.message };
  }

  if (!expiredOrders || expiredOrders.length === 0) {
    return { expiredCount: 0, error: null };
  }

  const expiredOrderIds = expiredOrders.map((o) => o.id);
  const productIds = expiredOrders.map((o) => o.product_id);

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({ status: "Dibatalkan" })
    .in("id", expiredOrderIds)
    .eq("status", "Menunggu Pembayaran");

  if (orderUpdateError) {
    return { expiredCount: 0, error: orderUpdateError.message };
  }

  await supabase
    .from("products")
    .update({ status: "Tersedia" })
    .in("id", productIds)
    .eq("status", "Dipesan");

  return { expiredCount: expiredOrders.length, error: null };
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
