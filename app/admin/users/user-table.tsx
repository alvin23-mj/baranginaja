"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { findDistrictName } from "@/lib/districts";
import type { AdminUserListItem } from "@/lib/types/database";
import { Toast } from "@/components/toast";

const STATUS_LABEL: Record<AdminUserListItem["status_verifikasi"], string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

const STATUS_CLASS: Record<AdminUserListItem["status_verifikasi"], string> = {
  pending:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  verified:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  rejected:
    "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
};

export function UserTable({
  users,
  adminId,
}: {
  users: AdminUserListItem[];
  adminId: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function handleVerifikasi(user: AdminUserListItem) {
    if (
      !window.confirm(
        `Verifikasi data domisili "${user.nama_lengkap}" (${user.email})? Status akan diubah dari Pending menjadi Verified.`
      )
    ) {
      return;
    }

    setLoadingId(user.id);
    const supabase = createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("users")
      .update({ status_verifikasi: "verified" })
      .eq("id", user.id)
      .eq("status_verifikasi", "pending");

    if (error) {
      setLoadingId(null);
      setToast(`Gagal memverifikasi user: ${error.message}`);
      return;
    }

    // Log activity — order_id is null for user verification
    await supabase.from("activity_logs").insert({
      admin_id: adminId,
      order_id: null,
      aksi: `Verifikasi User: ${user.nama_lengkap}`,
      timestamp: now,
    });

    setLoadingId(null);
    setToast(`User "${user.nama_lengkap}" berhasil diverifikasi.`);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
          <tr>
            <th className="px-4 py-3">Nama</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">No HP</th>
            <th className="px-4 py-3">Kecamatan</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Penjual</th>
            <th className="px-4 py-3">Verifikasi</th>
            <th className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const districtName =
              user.kecamatan?.nama_kecamatan ||
              findDistrictName(user.kecamatan_id) ||
              findDistrictName(user.kampus_id) ||
              user.kampus?.nama_kampus;

            return (
              <tr
                key={user.id}
                className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
              >
                <td className="px-4 py-3 font-medium text-zinc-950 dark:text-zinc-50">
                  {user.nama_lengkap}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {user.no_hp}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {districtName ? `Kec. ${districtName}` : "-"}
                </td>
              <td className="px-4 py-3 text-zinc-700 capitalize dark:text-zinc-300">
                {user.role}
              </td>
              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                {user.is_seller ? (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                    Ya
                  </span>
                ) : (
                  "Tidak"
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[user.status_verifikasi]}`}
                >
                  {STATUS_LABEL[user.status_verifikasi]}
                </span>
              </td>
              <td className="px-4 py-3">
                {user.status_verifikasi === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleVerifikasi(user)}
                    disabled={loadingId === user.id}
                    className="whitespace-nowrap rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loadingId === user.id ? "Memproses..." : "Verifikasi"}
                  </button>
                )}
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
