import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function requireSeller(
  supabase: SupabaseClient,
  currentPath: string
) {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?redirectTo=${currentPath}`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, is_seller, alamat_kos, lat, lng")
    .eq("id", authUser.id)
    .single();

  if (!profile || !profile.is_seller) {
    redirect("/profil");
  }

  return { user: authUser, profile: profile as SellerProfile };
}

export interface SellerProfile {
  id: string;
  is_seller: boolean;
  alamat_kos: string | null;
  lat: number | null;
  lng: number | null;
}

export async function requireAdmin(
  supabase: SupabaseClient,
  currentPath: string
) {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?redirectTo=${currentPath}`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", authUser.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/?akses_ditolak=1");
  }

  return { user: authUser, profile: profile as AdminProfile };
}

export interface AdminProfile {
  id: string;
  role: "buyer" | "seller" | "admin";
}
