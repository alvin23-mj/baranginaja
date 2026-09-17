import { createClient } from "@/lib/supabase/server";
import { requireSeller } from "@/lib/supabase/guards";
import { formatRupiah } from "@/lib/pricing";
import { PAYOUT_STATUS_CLASS, PAYOUT_STATUS_LABEL } from "@/lib/payouts";
import type { SellerPayoutListItem } from "@/lib/types/database";

const PAYOUT_SELECT = "*, order:orders(product:products(nama_barang))";

export default async function PendapatanPage() {
  const supabase = await createClient();
  const { user } = await requireSeller(supabase, "/jual/pendapatan");

  const { data, error: payoutsError } = await supabase
    .from("payouts")
    .select(PAYOUT_SELECT)
    .eq("seller_id", user.id)
    .order("id", { ascending: false });

  if (payoutsError) {
    console.error("Gagal memuat data pendapatan:", payoutsError);
  }

  const payouts = (data as SellerPayoutListItem[]) ?? [];

  const totalDiterima = payouts
    .filter((p) => p.status === "dicairkan")
    .reduce((sum, p) => sum + p.nominal, 0);
  const totalMenunggu = payouts
    .filter((p) => p.status === "menunggu")
    .reduce((sum, p) => sum + p.nominal, 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Pendapatan
      </h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Total pendapatan diterima
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(totalDiterima)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Menunggu pencairan
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatRupiah(totalMenunggu)}
          </p>
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Belum ada riwayat pendapatan
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Penghasilan dari penjualan barang yang selesai akan masuk ke sini.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
              <tr>
                <th className="px-4 py-3">Barang</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal Dicairkan</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr
                  key={payout.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 font-medium text-zinc-950 dark:text-zinc-50">
                    {payout.order?.product?.nama_barang ?? "-"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-zinc-950 dark:text-zinc-50">
                    {formatRupiah(payout.nominal)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYOUT_STATUS_CLASS[payout.status]}`}
                    >
                      {PAYOUT_STATUS_LABEL[payout.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {payout.tanggal_dicairkan
                      ? new Date(payout.tanggal_dicairkan).toLocaleString(
                          "id-ID"
                        )
                      : "-"}
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
