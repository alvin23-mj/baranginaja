import { createClient } from "@/lib/supabase/server";
import { getDistricts, findDistrictName } from "@/lib/districts";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let isSeller = false;
  let userName: string | null = null;
  let districtName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, is_seller, nama_lengkap, kecamatan_id, kecamatan:districts(nama_kecamatan)")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
    isSeller = profile?.is_seller ?? false;
    userName = profile?.nama_lengkap ?? null;
    districtName =
      (profile?.kecamatan as unknown as { nama_kecamatan: string } | null)?.nama_kecamatan ??
      findDistrictName(profile?.kecamatan_id) ??
      null;
  }

  // Fetch categories for the category menu
  const { data: categories } = await supabase
    .from("categories")
    .select("id, nama_kategori")
    .order("nama_kategori", { ascending: true });

  // Fetch active districts for the registration drawer
  const districts = await getDistricts(supabase);

  return (
    <NavbarClient
      user={user ? { id: user.id, email: user.email, name: userName } : null}
      isAdmin={isAdmin}
      isSeller={isSeller}
      districtName={districtName}
      categories={categories ?? []}
      districts={districts}
    />
  );
}
