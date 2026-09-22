import type { SupabaseClient } from "@supabase/supabase-js";
import type { PayoutStatus } from "@/lib/types/database";

export const PAYOUT_STATUS_LABEL: Record<PayoutStatus, string> = {
  menunggu: "Menunggu",
  dicairkan: "Dicairkan",
};

export const PAYOUT_STATUS_CLASS: Record<PayoutStatus, string> = {
  menunggu:
    "bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700",
  dicairkan:
    "bg-zinc-950 text-white border border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold",
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
