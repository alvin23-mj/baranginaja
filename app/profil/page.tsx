import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDistricts, findDistrictName } from "@/lib/districts";
import type { UserWithKampus } from "@/lib/types/database";
import { ProfileTabsClient } from "./profile-tabs-client";

export const metadata = {
  title: "Profil Saya - BaranginAja",
  description: "Kelola data akun, alamat domisili Surabaya, dan status mode penjual di BaranginAja",
};

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirectTo=/profil");
  }

  const [{ data: profile }, districts, { count: productCount }] = await Promise.all([
    supabase
      .from("users")
      .select("*, kecamatan:districts(id, nama_kecamatan)")
      .eq("id", authUser.id)
      .single(),
    getDistricts(supabase),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", authUser.id),
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
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0f0f11] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto w-full max-w-4xl">
        <ProfileTabsClient
          user={user}
          districts={districts}
          productCount={productCount ?? 0}
          districtName={districtName}
        />
      </div>
    </div>
  );
}
