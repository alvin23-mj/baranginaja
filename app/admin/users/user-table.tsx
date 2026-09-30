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
    "bg-zinc-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700",
  verified:
    "bg-zinc-950 text-white border border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-semibold",
  rejected:
    "bg-zinc-100 text-zinc-500 border border-zinc-300 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800 line-through",
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
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

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
            <th className="px-4 py-3">Password</th>
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
                <td className="px-4 py-3 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    {user.password ? (
                      <>
                        <span>{visiblePasswords[user.id] ? user.password : "••••••••"}</span>
                        <button
                          suppressHydrationWarning
                          type="button"
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                          title={visiblePasswords[user.id] ? "Sembunyikan Password" : "Tampilkan Password"}
                        >
                          {visiblePasswords[user.id] ? (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.96 8.96 0 013.682-.788c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" /></svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="text-zinc-400 italic dark:text-zinc-500">-</span>
                    )}
                  </div>
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
                  <span className="rounded-full border border-zinc-950 bg-zinc-950 px-2 py-0.5 text-xs font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
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
                    className="whitespace-nowrap rounded-md bg-zinc-950 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-60"
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
