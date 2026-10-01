"use client";

import Link from "next/link";
import { Check, Clock } from "lucide-react";
import { formatRupiah } from "@/lib/pricing";
import { PAYOUT_STATUS_LABEL } from "@/lib/payouts";
import type { SellerPayoutListItem } from "@/lib/types/database";
import { CardSparkline } from "./user-dashboard-view";

interface PendapatanViewProps {
  payouts: SellerPayoutListItem[];
  bankInfo?: {
    namaBank: string | null;
    noRekening: string | null;
    namaPemilik: string | null;
  } | null;
}

export function PendapatanView({ payouts, bankInfo }: PendapatanViewProps) {
  const totalDiterima = payouts
    .filter((p) => p.status === "dicairkan")
    .reduce((sum, p) => sum + p.nominal, 0);

  const totalMenunggu = payouts
    .filter((p) => p.status === "menunggu")
    .reduce((sum, p) => sum + p.nominal, 0);

  return (
    <div className="space-y-6">
      {/* 3 Metric Stat Cards matching Dashboard design */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Pendapatan Diterima */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition-all dark:bg-zinc-900 block">
          {/* Large partially-visible watermark icon */}
          <div className="absolute -top-3 -right-3 text-zinc-400 opacity-50 dark:text-zinc-600 pointer-events-none">
            <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Pendapatan Diterima
            </span>
          </div>
          <p className="relative z-10 mt-2 text-2xl font-normal text-zinc-950 dark:text-zinc-50">
            {formatRupiah(totalDiterima)}
          </p>
          <div className="relative z-10 mt-3">
            <CardSparkline
              id="chart-pendapatan-diterima"
              color="emerald"
              data={[150000, 300000, 250000, 600000, 500000, 850000, Math.max(totalDiterima, 1000000)]}
            />
          </div>
        </div>

        {/* Card 2: Menunggu Pencairan */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition-all dark:bg-zinc-900 block">
          {/* Large partially-visible watermark icon */}
          <div className="absolute -top-3 -right-3 text-zinc-400 opacity-50 dark:text-zinc-600 pointer-events-none">
            <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Menunggu Pencairan
            </span>
          </div>
          <p className="relative z-10 mt-2 text-2xl font-normal text-zinc-950 dark:text-zinc-50">
            {formatRupiah(totalMenunggu)}
          </p>
          <div className="relative z-10 mt-3">
            <CardSparkline
              id="chart-pendapatan-menunggu"
              color="amber"
              data={[0, 100000, 0, 150000, 50000, 0, Math.max(totalMenunggu, 0)]}
            />
          </div>
        </div>

        {/* Card 3: Rekening Pencairan (Detail yang sebelumnya ada di bawah) */}
        <Link
          href="/profil"
          className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition-all dark:bg-zinc-900 block"
          title="Ubah rekening pencairan di profil"
        >
          {/* Large partially-visible watermark icon */}
          <div className="absolute -top-3 -right-3 text-zinc-400 opacity-50 dark:text-zinc-600 pointer-events-none">
            <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
              Rekening Pencairan
            </span>
          </div>

          {bankInfo?.noRekening ? (
            <div className="relative z-10 mt-2">
              <p className="text-2xl font-normal text-zinc-950 dark:text-zinc-50 truncate">
                {bankInfo.namaBank ? `${bankInfo.namaBank} • ${bankInfo.noRekening}` : bankInfo.noRekening}
              </p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                {bankInfo.namaPemilik ? `a.n. ${bankInfo.namaPemilik}` : "Rekening aktif"}
              </p>
            </div>
          ) : (
            <div className="relative z-10 mt-2">
              <p className="text-2xl font-normal text-zinc-400 dark:text-zinc-500">
                Belum Diatur
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Klik untuk atur di profil
              </p>
            </div>
          )}

          <div className="relative z-10 mt-3">
            <CardSparkline
              id="chart-pendapatan-rekening"
              color="purple"
              data={[3, 5, 4, 7, 6, 8, 9]}
            />
          </div>
        </Link>
      </div>


      {/* Tabel Riwayat Pencairan */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-normal text-zinc-950 dark:text-zinc-50">
            Riwayat Pencairan Dana
          </h2>
        </div>

        {payouts.length === 0 ? (
          <div className="py-12 text-center text-sm font-normal text-zinc-500 dark:text-zinc-400">
            Belum ada data pencairan. Pendapatan akan otomatis tercatat ketika barang jualanmu telah selesai dikonfirmasi pembeli.
          </div>
        ) : (
          <table className="w-full text-left text-sm font-normal">
            <thead className="border-b border-zinc-200 bg-zinc-50/75 text-sm font-normal text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3.5 font-normal">ID Payout</th>
                <th className="px-4 py-3.5 font-normal">Produk</th>
                <th className="px-4 py-3.5 font-normal">Nominal</th>
                <th className="px-4 py-3.5 font-normal">Status</th>
                <th className="px-5 py-3.5 font-normal">Tanggal Dicairkan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors dark:hover:bg-zinc-800/40">
                  <td className="px-5 py-3.5 font-mono text-zinc-600 dark:text-zinc-400">
                    #{p.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3.5 font-normal text-zinc-900 dark:text-zinc-100">
                    {p.order?.product?.nama_barang ?? "Produk transaksi"}
                  </td>
                  <td className="px-4 py-3.5 font-normal text-zinc-950 dark:text-zinc-50">
                    {formatRupiah(p.nominal)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-normal ${
                        p.status === "dicairkan"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {p.status === "dicairkan" ? (
                        <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                      ) : (
                        <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                      )}
                      {PAYOUT_STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {p.tanggal_dicairkan
                      ? new Date(p.tanggal_dicairkan).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
