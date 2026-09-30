import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import { getDistricts } from "@/lib/districts";
import {
  UserManagementView,
  ExtendedUserItem,
} from "./user-management-view";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { user: adminUser } = await requireAdmin(supabase, "/admin/users");

  const [
    { data: usersData, error: usersError },
    districts,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("*")
      .order("nama_lengkap", { ascending: true }),

    getDistricts(supabase),
  ]);

  if (usersError) {
    console.error("Gagal mengambil data users:", JSON.stringify(usersError, null, 2));
  }

  const rawUsers = usersData ?? [];
  const districtsMap = new Map(districts.map((d) => [String(d.id), d]));

  const users: ExtendedUserItem[] = rawUsers.map((u) => ({
    ...u,
    kecamatan: u.kecamatan_id ? districtsMap.get(String(u.kecamatan_id)) || null : null,
  }));

  return (
    <UserManagementView
      initialUsers={users}
      districts={districts}
      adminId={adminUser.id}
    />
  );
}
