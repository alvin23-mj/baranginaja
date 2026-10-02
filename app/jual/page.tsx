import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findDistrictName } from "@/lib/districts";
import { expireHoldIfNeeded } from "@/lib/orders";
import type {
  ProductWithCategory,
  OrderListItem,
  SellerPayoutListItem,
} from "@/lib/types/database";
import { UserDashboardView } from "./user-dashboard-view";

export const metadata = {
  title: "Dashboard User - BaranginAja",
  description:
    "Kelola produk jualanmu, pantau pesanan pembelian, dan cek saldo pendapatan di BaranginAja.",
};

const ORDER_SELECT =
  "*, product:products(id, nama_barang, foto_urls, harga_jual, berat_kg, seller:users(id, nama_lengkap, no_hp))";
const PAYOUT_SELECT = "*, order:orders(product:products(nama_barang))";

export default async function JualPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirectTo=/jual");
  }

  const [
    { data: products },
    { data: buyerOrdersData },
    { data: payoutsData },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*, kategori:categories(id, nama_kategori)")
      .eq("seller_id", authUser.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("buyer_id", authUser.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payouts")
      .select(PAYOUT_SELECT)
      .eq("seller_id", authUser.id)
      .order("id", { ascending: false }),
    supabase
      .from("users")
      .select(
        "nama_lengkap, is_seller, nama_bank, no_rekening, nama_pemilik_rekening, kecamatan_id, kecamatan:districts(id, nama_kecamatan)"
      )
      .eq("id", authUser.id)
      .single(),
  ]);

  const buyerOrders = await Promise.all(
    ((buyerOrdersData as OrderListItem[]) ?? []).map((order) =>
      expireHoldIfNeeded(supabase, order)
    )
  );

  const districtName =
    (profile?.kecamatan as unknown as { nama_kecamatan: string } | null)
      ?.nama_kecamatan ??
    findDistrictName(profile?.kecamatan_id) ??
    null;

  const bankInfo = {
    namaBank: profile?.nama_bank ?? null,
    noRekening: profile?.no_rekening ?? null,
    namaPemilik: profile?.nama_pemilik_rekening ?? null,
  };

  return (
    <Suspense fallback={null}>
      <UserDashboardView
        isSeller={Boolean(profile?.is_seller)}
        userName={profile?.nama_lengkap ?? "User"}
        products={(products as ProductWithCategory[]) ?? []}
        buyerOrders={buyerOrders}
        payouts={(payoutsData as SellerPayoutListItem[]) ?? []}
        bankInfo={bankInfo}
        districtName={districtName}
      />
    </Suspense>
  );
}
