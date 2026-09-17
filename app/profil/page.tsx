import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDistricts, findDistrictName } from "@/lib/districts";
import type { UserWithKampus } from "@/lib/types/database";
import { ProfileForm } from "./profile-form";
import { SellerSection } from "./seller-section";

const STATUS_LABEL: Record<UserWithKampus["status_verifikasi"], string> = {
  pending: "Menunggu verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

const STATUS_CLASS: Record<UserWithKampus["status_verifikasi"], string> = {
  pending:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  verified:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  rejected:
    "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
};

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirectTo=/profil");
  }

  const [{ data: profile }, districts] = await Promise.all([
    supabase
      .from("users")
      .select("*, kecamatan:districts(id, nama_kecamatan)")
      .eq("id", authUser.id)
      .single(),
    getDistricts(supabase),
  ]);

  if (!profile) {
    redirect("/login?redirectTo=/profil");
  }

  const user = profile as UserWithKampus;
  const districtName =
    user.kecamatan?.nama_kecamatan ||
    findDistrictName(user.kecamatan_id) ||
    findDistrictName(user.kampus_id) ||
    user.kampus?.nama_kampus ||
    "-";

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Profil</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Kelola data diri dan status penjualmu.
      </p>

      <div className="mb-8 flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Email</span>
          <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
            {user.email}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Kecamatan (Surabaya)</span>
          <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
            {districtName !== "-" ? `Kec. ${districtName}` : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Status verifikasi</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[user.status_verifikasi]}`}
          >
            {STATUS_LABEL[user.status_verifikasi]}
          </span>
        </div>
      </div>

      <h2 className="mb-4 text-base font-semibold text-zinc-950 dark:text-zinc-50">
        Edit Profil
      </h2>
      <ProfileForm user={user} districts={districts} />

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />

      <SellerSection user={user} />
    </div>
  );
}
