"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRow, District } from "@/lib/types/database";
import { AdminPageHeader } from "../admin-page-header";
import { Toast } from "@/components/toast";

export interface ExtendedUserItem extends UserRow {
  kecamatan?: Pick<District, "id" | "nama_kecamatan"> | null;
}

interface UserManagementViewProps {
  initialUsers: ExtendedUserItem[];
  districts: Pick<District, "id" | "nama_kecamatan">[];
  adminId: string;
}

const ROLE_OPTIONS: UserRow["role"][] = ["buyer", "seller", "admin"];
const STATUS_OPTIONS: UserRow["status_verifikasi"][] = ["pending", "verified", "rejected"];

export function UserManagementView({
  initialUsers,
  districts,
  adminId,
}: UserManagementViewProps) {
  const router = useRouter();
  const [users, setUsers] = useState<ExtendedUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<ExtendedUserItem | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<ExtendedUserItem | null>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState<{
    nama_lengkap: string;
    email: string;
    password: string;
    no_hp: string;
    role: UserRow["role"];
    is_seller: boolean;
    status_verifikasi: UserRow["status_verifikasi"];
    no_rekening: string;
    nama_bank: string;
    nama_pemilik_rekening: string;
    alamat_kos: string;
    kecamatan_id: string;
  }>({
    nama_lengkap: "",
    email: "",
    password: "",
    no_hp: "",
    role: "buyer",
    is_seller: false,
    status_verifikasi: "verified",
    no_rekening: "",
    nama_bank: "",
    nama_pemilik_rekening: "",
    alamat_kos: "",
    kecamatan_id: "",
  });

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [showFormPassword, setShowFormPassword] = useState(false);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Counts
  const totalPending = useMemo(
    () => users.filter((u) => u.status_verifikasi === "pending").length,
    [users]
  );

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status_verifikasi !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nama = u.nama_lengkap?.toLowerCase() ?? "";
        const email = u.email?.toLowerCase() ?? "";
        const hp = u.no_hp?.toLowerCase() ?? "";
        return nama.includes(q) || email.includes(q) || hp.includes(q);
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      nama_lengkap: "",
      email: "",
      password: "",
      no_hp: "",
      role: "buyer",
      is_seller: false,
      status_verifikasi: "verified",
      no_rekening: "",
      nama_bank: "",
      nama_pemilik_rekening: "",
      alamat_kos: "",
      kecamatan_id: districts[0]?.id ? String(districts[0].id) : "",
    });
    setShowFormPassword(false);
    setCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: ExtendedUserItem) => {
    setEditUser(user);
    setFormData({
      nama_lengkap: user.nama_lengkap || "",
      email: user.email || "",
      password: user.password || "",
      no_hp: user.no_hp || "",
      role: user.role || "buyer",
      is_seller: user.is_seller || false,
      status_verifikasi: user.status_verifikasi || "verified",
      no_rekening: user.no_rekening || "",
      nama_bank: user.nama_bank || "",
      nama_pemilik_rekening: user.nama_pemilik_rekening || "",
      alamat_kos: user.alamat_kos || "",
      kecamatan_id: user.kecamatan_id ? String(user.kecamatan_id) : "",
    });
    setShowFormPassword(false);
  };

  // Submit Create Account
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const supabase = createClient();

    const payload = {
      nama_lengkap: formData.nama_lengkap,
      email: formData.email,
      password: formData.password || null,
      no_hp: formData.no_hp,
      role: formData.role,
      is_seller: formData.is_seller || formData.role === "seller",
      status_verifikasi: formData.status_verifikasi,
      no_rekening: formData.no_rekening || null,
      nama_bank: formData.nama_bank || null,
      nama_pemilik_rekening: formData.nama_pemilik_rekening || null,
      alamat_kos: formData.alamat_kos || null,
      kecamatan_id: formData.kecamatan_id || null,
    };

    const { data, error } = await supabase
      .from("users")
      .insert(payload)
      .select("*, kecamatan:districts(id, nama_kecamatan)")
      .single();

    if (error) {
      alert(`Gagal membuat akun: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    // Log Activity
    await supabase.from("activity_logs").insert({
      admin_id: adminId,
      order_id: null,
      aksi: `Membuat Akun Baru: ${formData.nama_lengkap} (${formData.role})`,
      timestamp: new Date().toISOString(),
    });

    setUsers((prev) => [data as ExtendedUserItem, ...prev]);
    setCreateModalOpen(false);
    setIsSubmitting(false);
    setToast(`Akun "${formData.nama_lengkap}" berhasil dibuat.`);
    router.refresh();
  };

  // Submit Edit Account & RBAC
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setIsSubmitting(true);
    const supabase = createClient();

    const payload = {
      nama_lengkap: formData.nama_lengkap,
      email: formData.email,
      password: formData.password || null,
      no_hp: formData.no_hp,
      role: formData.role,
      is_seller: formData.is_seller || formData.role === "seller",
      status_verifikasi: formData.status_verifikasi,
      no_rekening: formData.no_rekening || null,
      nama_bank: formData.nama_bank || null,
      nama_pemilik_rekening: formData.nama_pemilik_rekening || null,
      alamat_kos: formData.alamat_kos || null,
      kecamatan_id: formData.kecamatan_id || null,
    };

    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", editUser.id);

    if (error) {
      alert(`Gagal memperbarui akun: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    // Log Activity
    await supabase.from("activity_logs").insert({
      admin_id: adminId,
      order_id: null,
      aksi: `Update Akun & RBAC: ${formData.nama_lengkap} (Role: ${formData.role}, Verifikasi: ${formData.status_verifikasi})`,
      timestamp: new Date().toISOString(),
    });

    const updatedDistrict = districts.find((d) => String(d.id) === String(formData.kecamatan_id));

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editUser.id
          ? {
              ...u,
              ...payload,
              kecamatan: updatedDistrict || u.kecamatan,
            }
          : u
      )
    );

    setEditUser(null);
    setIsSubmitting(false);
    setToast(`Data akun "${formData.nama_lengkap}" berhasil diperbarui.`);
    router.refresh();
  };

  // Quick RBAC Role Update directly from table
  const handleQuickRoleChange = async (userId: string, newRole: UserRow["role"]) => {
    setLoadingId(userId);
    const supabase = createClient();
    const isSeller = newRole === "seller" || users.find((u) => u.id === userId)?.is_seller;

    const { error } = await supabase
      .from("users")
      .update({ role: newRole, is_seller: isSeller })
      .eq("id", userId);

    if (error) {
      alert(`Gagal memperbarui role RBAC: ${error.message}`);
      setLoadingId(null);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole, is_seller: !!isSeller } : u))
    );
    setLoadingId(null);
    setToast("Role RBAC berhasil diperbarui.");
  };

  // Quick Verification Status Change directly from table
  const handleQuickStatusChange = async (userId: string, newStatus: UserRow["status_verifikasi"]) => {
    setLoadingId(userId);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({ status_verifikasi: newStatus })
      .eq("id", userId);

    if (error) {
      alert(`Gagal memperbarui verifikasi: ${error.message}`);
      setLoadingId(null);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status_verifikasi: newStatus } : u))
    );
    setLoadingId(null);
    setToast("Status verifikasi berhasil diperbarui.");
  };

  // Delete User Account
  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    setIsSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", deleteUserTarget.id);

    if (error) {
      alert(`Gagal menghapus user: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    // Log Activity
    await supabase.from("activity_logs").insert({
      admin_id: adminId,
      order_id: null,
      aksi: `Hapus Akun User: ${deleteUserTarget.nama_lengkap} (${deleteUserTarget.email})`,
      timestamp: new Date().toISOString(),
    });

    setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
    setDeleteUserTarget(null);
    setIsSubmitting(false);
    setToast(`Akun "${deleteUserTarget.nama_lengkap}" berhasil dihapus.`);
    router.refresh();
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      <AdminPageHeader
        title="Kelola User &amp; Hak Akses (RBAC)"
        subtitle="Manajemen penuh akun pengguna, kontrol otorisasi role (RBAC), dan verifikasi penjual"
        backLink={{ href: "/admin", label: "Kembali ke Dashboard" }}
        badge={
          totalPending > 0 ? (
            <span className="rounded-full bg-amber-500/10 border border-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
              {totalPending} menunggu verifikasi
            </span>
          ) : undefined
        }
      />

      {/* Filter & Search Bar + Action Button */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            suppressHydrationWarning
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama lengkap, email, atau nomor HP..."
            className="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-950 shadow-2xs placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <svg className="absolute left-3 top-2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            suppressHydrationWarning
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-950 shadow-2xs focus:border-zinc-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">Semua Role</option>
            <option value="buyer">Buyer (Pembeli)</option>
            <option value="seller">Seller (Penjual)</option>
            <option value="admin">Admin (Pengelola)</option>
          </select>

          {/* Status Filter */}
          <select
            suppressHydrationWarning
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-950 shadow-2xs focus:border-zinc-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">Semua Verifikasi</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Tambah User Baru Button */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah User Baru
          </button>
        </div>
      </div>

      {/* User Table */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Tidak Ada User Ditemukan
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Coba sesuaikan kata kunci pencarian atau filter role.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
              <tr>
                <th className="px-4 py-3">Nama &amp; Email</th>
                <th className="px-4 py-3">Password / Sandi</th>
                <th className="px-4 py-3">No. HP</th>
                <th className="px-4 py-3">Lokasi / Kecamatan</th>
                <th className="px-4 py-3">Role (RBAC)</th>
                <th className="px-4 py-3">Penjual</th>
                <th className="px-4 py-3">Status Verifikasi</th>
                <th className="px-4 py-3 text-right">Aksi Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isUserLoading = loadingId === user.id;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                  >
                    {/* Nama & Email */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                        {user.nama_lengkap}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono dark:text-zinc-400">
                        {user.email}
                      </p>
                    </td>

                    {/* Password / Sandi */}
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        {user.password ? (
                          <>
                            <span>{visiblePasswords[user.id] ? user.password : "••••••••"}</span>
                            <button
                              suppressHydrationWarning
                              type="button"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
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

                    {/* No HP */}
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      {user.no_hp || "-"}
                    </td>

                    {/* Lokasi / Kecamatan */}
                    <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                      {user.kecamatan?.nama_kecamatan || user.alamat_kos || "-"}
                    </td>

                    {/* Role RBAC Selector */}
                    <td className="px-4 py-3">
                      <select
                        suppressHydrationWarning
                        disabled={isUserLoading}
                        value={user.role}
                        onChange={(e) =>
                          handleQuickRoleChange(user.id, e.target.value as UserRow["role"])
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize focus:outline-hidden ${
                          user.role === "admin"
                            ? "bg-purple-500/10 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                            : user.role === "seller"
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Penjual Badge */}
                    <td className="px-4 py-3 text-xs">
                      {user.is_seller ? (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-300 px-2 py-0.5 font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Penjual
                        </span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500">Non-Penjual</span>
                      )}
                    </td>

                    {/* Verification Selector */}
                    <td className="px-4 py-3">
                      <select
                        suppressHydrationWarning
                        disabled={isUserLoading}
                        value={user.status_verifikasi}
                        onChange={(e) =>
                          handleQuickStatusChange(
                            user.id,
                            e.target.value as UserRow["status_verifikasi"]
                          )
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-hidden ${
                          user.status_verifikasi === "verified"
                            ? "bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100"
                            : user.status_verifikasi === "pending"
                            ? "bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                            : "bg-rose-500/10 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          suppressHydrationWarning
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          Edit
                        </button>
                        <button
                          suppressHydrationWarning
                          type="button"
                          onClick={() => setDeleteUserTarget(user)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- Create User Modal ---- */}
      {createModalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setCreateModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Tambah Akun User Baru
              </h3>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Nama Lengkap *
                </label>
                <input
                  suppressHydrationWarning
                  required
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Email *
                  </label>
                  <input
                    suppressHydrationWarning
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="budi@email.com"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Password / Sandi Akun *
                  </label>
                  <div className="relative">
                    <input
                      suppressHydrationWarning
                      required
                      type={showFormPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password6..."
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-8 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword((prev) => !prev)}
                      className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs p-0.5 rounded"
                      title={showFormPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showFormPassword ? (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.96 8.96 0 013.682-.788c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" /></svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  No. HP (WhatsApp) *
                </label>
                <input
                  suppressHydrationWarning
                  required
                  type="text"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  placeholder="081234567890"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Role RBAC *
                  </label>
                  <select
                    suppressHydrationWarning
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRow["role"],
                        is_seller: e.target.value === "seller" ? true : formData.is_seller,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold capitalize text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="buyer">Buyer (Pembeli)</option>
                    <option value="seller">Seller (Penjual)</option>
                    <option value="admin">Admin (Pengelola)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Status Verifikasi *
                  </label>
                  <select
                    suppressHydrationWarning
                    value={formData.status_verifikasi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status_verifikasi: e.target.value as UserRow["status_verifikasi"],
                      })
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="verified">Verified (Disetujui)</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  suppressHydrationWarning
                  type="checkbox"
                  id="create_is_seller"
                  checked={formData.is_seller}
                  onChange={(e) => setFormData({ ...formData, is_seller: e.target.checked })}
                  className="rounded border-zinc-300 text-zinc-900 dark:border-zinc-700"
                />
                <label htmlFor="create_is_seller" className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Aktifkan Status Hak Akses Penjual (is_seller)
                </label>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Kecamatan (Lokasi Surabaya)
                </label>
                <select
                  suppressHydrationWarning
                  value={formData.kecamatan_id}
                  onChange={(e) => setFormData({ ...formData, kecamatan_id: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  {districts.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.nama_kecamatan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Alamat Kos / Domisili
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={formData.alamat_kos}
                  onChange={(e) => setFormData({ ...formData, alamat_kos: e.target.value })}
                  placeholder="Jl. Keputih Tegal No. 12"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nama Bank
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formData.nama_bank}
                    onChange={(e) => setFormData({ ...formData, nama_bank: e.target.value })}
                    placeholder="BCA / Mandiri"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    No. Rekening
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formData.no_rekening}
                    onChange={(e) => setFormData({ ...formData, no_rekening: e.target.value })}
                    placeholder="1234567890"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Pemilik Rekening
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formData.nama_pemilik_rekening}
                    onChange={(e) => setFormData({ ...formData, nama_pemilik_rekening: e.target.value })}
                    placeholder="Nama Pemilik"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Batal
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-zinc-950 px-4 py-2 font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                >
                  {isSubmitting ? "Menyimpan..." : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Edit User & RBAC Modal ---- */}
      {editUser && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setEditUser(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Edit Akun &amp; Otorisasi RBAC: {editUser.nama_lengkap}
              </h3>
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setEditUser(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Nama Lengkap *
                </label>
                <input
                  suppressHydrationWarning
                  required
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Email *
                  </label>
                  <input
                    suppressHydrationWarning
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Password / Sandi Akun
                  </label>
                  <div className="relative">
                    <input
                      suppressHydrationWarning
                      type={showFormPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password baru..."
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-8 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword((prev) => !prev)}
                      className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs p-0.5 rounded"
                      title={showFormPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showFormPassword ? (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.96 8.96 0 013.682-.788c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" /></svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  No. HP *
                </label>
                <input
                  suppressHydrationWarning
                  required
                  type="text"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Role RBAC *
                  </label>
                  <select
                    suppressHydrationWarning
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRow["role"],
                        is_seller: e.target.value === "seller" ? true : formData.is_seller,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold capitalize text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="buyer">Buyer (Pembeli)</option>
                    <option value="seller">Seller (Penjual)</option>
                    <option value="admin">Admin (Pengelola)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Status Verifikasi *
                  </label>
                  <select
                    suppressHydrationWarning
                    value={formData.status_verifikasi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status_verifikasi: e.target.value as UserRow["status_verifikasi"],
                      })
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="verified">Verified (Disetujui)</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  suppressHydrationWarning
                  type="checkbox"
                  id="edit_is_seller"
                  checked={formData.is_seller}
                  onChange={(e) => setFormData({ ...formData, is_seller: e.target.checked })}
                  className="rounded border-zinc-300 text-zinc-900 dark:border-zinc-700"
                />
                <label htmlFor="edit_is_seller" className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Hak Akses Penjual (is_seller)
                </label>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Kecamatan (Lokasi Surabaya)
                </label>
                <select
                  suppressHydrationWarning
                  value={formData.kecamatan_id}
                  onChange={(e) => setFormData({ ...formData, kecamatan_id: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  {districts.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.nama_kecamatan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Alamat Kos / Domisili
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={formData.alamat_kos}
                  onChange={(e) => setFormData({ ...formData, alamat_kos: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nama Bank
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formData.nama_bank}
                    onChange={(e) => setFormData({ ...formData, nama_bank: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    No. Rekening
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formData.no_rekening}
                    onChange={(e) => setFormData({ ...formData, no_rekening: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Pemilik Rekening
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formData.nama_pemilik_rekening}
                    onChange={(e) => setFormData({ ...formData, nama_pemilik_rekening: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Batal
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-zinc-950 px-4 py-2 font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                >
                  {isSubmitting ? "Simpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Delete User Confirmation Modal ---- */}
      {deleteUserTarget && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteUserTarget(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              Konfirmasi Hapus Akun
            </h3>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus akun user{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">
                &ldquo;{deleteUserTarget.nama_lengkap}&rdquo; ({deleteUserTarget.email})
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setDeleteUserTarget(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Batal
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus Akun"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
