import type { SupabaseClient } from "@supabase/supabase-js";
import type { PayoutStatus } from "@/lib/types/database";

export const PAYOUT_STATUS_LABEL: Record<PayoutStatus, string> = {
  menunggu: "Menunggu",
  dicairkan: "Dicairkan",
};

export const PAYOUT_STATUS_CLASS: Record<PayoutStatus, string> = {
  menunggu:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  dicairkan:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
};

// Nominal payout = harga_input produk (bukan harga_jual) — markup & ongkir
// adalah revenue platform, bukan hak penjual.
export async function createPayoutIfNeeded(
  supabase: SupabaseClient,
  params: { orderId: string; sellerId: string; nominal: number }
): Promise<{ error: string | null }> {
  const { data: existing, error: selectError } = await supabase
    .from("payouts")
    .select("id")
    .eq("order_id", params.orderId)
    .maybeSingle();

  if (selectError) {
    return { error: selectError.message };
  }
  if (existing) {
    return { error: null };
  }

  const { error: insertError } = await supabase.from("payouts").insert({
    order_id: params.orderId,
    seller_id: params.sellerId,
    nominal: params.nominal,
    status: "menunggu",
    tanggal_dicairkan: null,
  });

  return { error: insertError?.message ?? null };
}
