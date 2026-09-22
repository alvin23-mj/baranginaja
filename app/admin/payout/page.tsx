import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import { formatRupiah } from "@/lib/pricing";
import type { AdminPayoutListItem, PayoutStatus } from "@/lib/types/database";
import { PayoutFilters } from "./payout-filters";
import { PayoutTable } from "./payout-table";

const PAYOUT_STATUSES: PayoutStatus[] = ["menunggu", "dicairkan"];

const PAYOUT_SELECT =
  "*, order:orders(id, created_at, product:products(nama_barang)), seller:users!payouts_seller_id_fkey(id, nama_lengkap, no_rekening, nama_bank, nama_pemilik_rekening)";

function paramStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

import { AdminPageHeader } from "../admin-page-header";

export default async function AdminPayoutPage({
  searchParams,
}: PageProps<"/admin/payout">) {
  const params = await searchParams;
  const supabase = await createClient();
  const { user } = await requireAdmin(supabase, "/admin/payout");

  const { data: payoutsData, error: payoutsError } = await supabase
    .from("payouts")
    .select(PAYOUT_SELECT)
    .order("id", { ascending: false });

  if (payoutsError) {
    console.error(
      "Gagal memuat data payout:",
      JSON.stringify(payoutsError, null, 2),
      "| message:", payoutsError.message,
      "| details:", payoutsError.details,
      "| hint:", payoutsError.hint,
      "| code:", payoutsError.code
    );
  }

  const payouts = (payoutsData as AdminPayoutListItem[]) ?? [];

  const totalMenunggu = payouts
    .filter((p) => p.status === "menunggu")
    .reduce((sum, p) => sum + p.nominal, 0);
  const totalDicairkan = payouts
    .filter((p) => p.status === "dicairkan")
    .reduce((sum, p) => sum + p.nominal, 0);

  const statusParam = paramStr(params.status);
  const status: PayoutStatus | "" = PAYOUT_STATUSES.includes(
    statusParam as PayoutStatus
  )
    ? (statusParam as PayoutStatus)
    : "";
  const search = paramStr(params.q).toLowerCase();

  const statusFiltered = status
    ? payouts.filter((p) => p.status === status)
    : payouts;

  const displayed = search
    ? statusFiltered.filter((p) => {
        const namaPenjual = p.seller?.nama_lengkap?.toLowerCase() ?? "";
        const namaBarang = p.order?.product?.nama_barang?.toLowerCase() ?? "";
        return namaPenjual.includes(search) || namaBarang.includes(search);
      })
    : statusFiltered;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      <AdminPageHeader
        title="Dashboard Payout"
        subtitle="Kelola dan konfirmasi pencairan dana saldo dompet penjual (seller)"
        backLink={{ href: "/admin", label: "Kembali ke Dashboard" }}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Total belum dicairkan
          </p>
          <p className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            {formatRupiah(totalMenunggu)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Total sudah dicairkan
          </p>
          <p className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            {formatRupiah(totalDicairkan)}
          </p>
        </div>
      </div>

      <PayoutFilters />

      {payoutsError ? (
        <p className="rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          Gagal memuat data payout: {payoutsError.message}
        </p>
      ) : displayed.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Tidak ada payout ditemukan.
        </p>
      ) : (
        <PayoutTable payouts={displayed} adminId={user.id} />
      )}
    </div>
  );
}
