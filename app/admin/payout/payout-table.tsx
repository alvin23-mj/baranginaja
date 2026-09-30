"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/pricing";
import { PAYOUT_STATUS_CLASS, PAYOUT_STATUS_LABEL } from "@/lib/payouts";
import type { AdminPayoutListItem } from "@/lib/types/database";
import { Toast } from "@/components/toast";

export function PayoutTable({
  payouts,
  adminId,
}: {
  payouts: AdminPayoutListItem[];
  adminId: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function handleTandaiDicairkan(payout: AdminPayoutListItem) {
    const namaPenjual = payout.seller?.nama_lengkap ?? "penjual ini";
    if (
      !window.confirm(
        `Tandai payout sebesar ${formatRupiah(payout.nominal)} untuk ${namaPenjual} sebagai sudah dicairkan? Pastikan dana sudah benar-benar ditransfer.`
      )
    ) {
      return;
    }

    setLoadingId(payout.id);
    const supabase = createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("payouts")
      .update({ status: "dicairkan", tanggal_dicairkan: now })
      .eq("id", payout.id)
      .eq("status", "menunggu");

    if (error) {
      setLoadingId(null);
      setToast(`Gagal mencairkan payout: ${error.message}`);
      return;
    }

    await supabase.from("activity_logs").insert({
      admin_id: adminId,
      order_id: payout.order_id,
      aksi: "Pencairan Payout",
      timestamp: now,
    });

    setLoadingId(null);
    setToast("Payout berhasil ditandai sudah dicairkan.");
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
          <tr>
            <th className="px-4 py-3">ID Order</th>
            <th className="px-4 py-3">Barang</th>
            <th className="px-4 py-3">Penjual</th>
            <th className="px-4 py-3">Rekening</th>
            <th className="px-4 py-3">Nominal</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Tanggal Dicairkan</th>
            <th className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr
              key={payout.id}
              className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
            >
              <td className="px-4 py-3 font-mono font-medium text-zinc-950 dark:text-zinc-50">
                {payout.order_id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                {payout.order?.product?.nama_barang ?? "-"}
              </td>
              <td className="px-4 py-3 font-medium text-zinc-950 dark:text-zinc-50">
                {payout.seller?.nama_lengkap ?? "-"}
              </td>
              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                <span className="font-medium text-zinc-950 dark:text-zinc-50">{payout.seller?.nama_bank ?? "-"}</span> ·{" "}
                <span className="font-mono">{payout.seller?.no_rekening ?? "-"}</span>
                <br />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  a.n. {payout.seller?.nama_pemilik_rekening ?? "-"}
                </span>
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
                  ? new Date(payout.tanggal_dicairkan).toLocaleString("id-ID")
                  : "-"}
              </td>
              <td className="px-4 py-3">
                {payout.status === "menunggu" && (
                  <button
                    type="button"
                    onClick={() => handleTandaiDicairkan(payout)}
                    disabled={loadingId === payout.id}
                    className="whitespace-nowrap rounded-md bg-zinc-950 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-60"
                  >
                    {loadingId === payout.id
                      ? "Memproses..."
                      : "Tandai Sudah Dicairkan"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
