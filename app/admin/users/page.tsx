import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import type { AdminUserListItem, UserRow } from "@/lib/types/database";
import { UserFilters } from "./user-filters";
import { UserTable } from "./user-table";

const VALID_ROLES: UserRow["role"][] = ["buyer", "seller", "admin"];
const VALID_STATUSES: UserRow["status_verifikasi"][] = [
  "pending",
  "verified",
  "rejected",
];

function paramStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export default async function AdminUsersPage({
  searchParams,
}: PageProps<"/admin/users">) {
  const params = await searchParams;
  const supabase = await createClient();
  const { user: adminUser } = await requireAdmin(supabase, "/admin/users");

  const roleParam = paramStr(params.role);
  const role: UserRow["role"] | "" = VALID_ROLES.includes(
    roleParam as UserRow["role"]
  )
    ? (roleParam as UserRow["role"])
    : "";

  const statusParam = paramStr(params.status);
  const statusVerifikasi: UserRow["status_verifikasi"] | "" =
    VALID_STATUSES.includes(statusParam as UserRow["status_verifikasi"])
      ? (statusParam as UserRow["status_verifikasi"])
      : "";

  let query = supabase
    .from("users")
    .select("*, kecamatan:districts(id, nama_kecamatan)")
    .order("nama_lengkap", { ascending: true });

  if (role) {
    query = query.eq("role", role);
  }
  if (statusVerifikasi) {
    query = query.eq("status_verifikasi", statusVerifikasi);
  }

  const { data: usersData } = await query;
  const users = (usersData as AdminUserListItem[]) ?? [];

  const totalPending = users.filter(
    (u) => u.status_verifikasi === "pending"
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
      >
        ← Kembali ke Dashboard
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Kelola User
        </h1>
        {totalPending > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
            {totalPending} menunggu verifikasi
          </span>
        )}
      </div>

      <UserFilters />

      {users.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Tidak ada user ditemukan.
        </p>
      ) : (
        <UserTable users={users} adminId={adminUser.id} />
      )}
    </div>
  );
}
