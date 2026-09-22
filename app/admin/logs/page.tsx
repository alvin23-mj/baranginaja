import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import type { ActivityLogWithDetails } from "@/lib/types/database";
import { LogFilters } from "./log-filters";
import { LogPagination } from "./log-pagination";
import { AdminPageHeader } from "../admin-page-header";

const PAGE_SIZE = 20;

const LOG_SELECT =
  "*, admin:users!admin_id(nama_lengkap), order:orders(id, product:products(nama_barang))";

function paramStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export default async function AdminLogsPage({
  searchParams,
}: PageProps<"/admin/logs">) {
  const params = await searchParams;
  const supabase = await createClient();
  await requireAdmin(supabase, "/admin/logs");

  // Parse filters
  const page = Math.max(1, parseInt(paramStr(params.page), 10) || 1);
  const dari = paramStr(params.dari);
  const sampai = paramStr(params.sampai);
  const adminFilter = paramStr(params.admin);
  const aksiSearch = paramStr(params.q);

  // Fetch admin users for dropdown
  const { data: adminUsers } = await supabase
    .from("users")
    .select("id, nama_lengkap")
    .eq("role", "admin");

  // Build log query
  let query = supabase
    .from("activity_logs")
    .select(LOG_SELECT, { count: "exact" })
    .order("timestamp", { ascending: false });

  if (dari) {
    query = query.gte("timestamp", `${dari}T00:00:00`);
  }
  if (sampai) {
    query = query.lte("timestamp", `${sampai}T23:59:59`);
  }
  if (adminFilter) {
    query = query.eq("admin_id", adminFilter);
  }
  if (aksiSearch) {
    query = query.ilike("aksi", `%${aksiSearch}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: logsData, count } = await query;
  const logs = (logsData as ActivityLogWithDetails[]) ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      <AdminPageHeader
        title="Activity Logs"
        subtitle="Riwayat audit log seluruh aktivitas tindakan admin di platform"
        backLink={{ href: "/admin", label: "Kembali ke Dashboard" }}
      />

      <LogFilters admins={adminUsers ?? []} />

      {logs.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Tidak ada log ditemukan.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Order Terkait</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(log.timestamp).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-950 dark:text-zinc-50">
                      {log.admin?.nama_lengkap ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-950 dark:text-zinc-50">
                      {log.aksi}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {log.order ? (
                        <Link
                          href={`/admin/order/${log.order.id}`}
                          className="font-semibold text-zinc-950 hover:underline dark:text-zinc-50"
                        >
                          {log.order.id.slice(0, 8)}
                          {log.order.product?.nama_barang &&
                            ` · ${log.order.product.nama_barang}`}
                        </Link>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <LogPagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
