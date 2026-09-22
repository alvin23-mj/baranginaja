import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import { expireHoldIfNeeded } from "@/lib/orders";
import {
  OrderManagementView,
  AdminOrderListItemFull,
} from "./order-management-view";

const ORDER_SELECT =
  "*, product:products(id, nama_barang, foto_urls, berat_kg, harga_input, harga_jual, kondisi, seller:users(id, nama_lengkap, no_hp, alamat_kos)), buyer:users!buyer_id(id, nama_lengkap, no_hp, alamat_kos)";

export default async function AdminOrderManagementPage() {
  const supabase = await createClient();
  const { user } = await requireAdmin(supabase, "/admin/order");

  const { data: ordersData, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Gagal mengambil data orders:",
      JSON.stringify(error, null, 2),
      "| message:",
      error.message,
      "| details:",
      error.details
    );
  }

  const rawOrders = (ordersData as unknown as AdminOrderListItemFull[]) ?? [];

  const reconciledOrders = await Promise.all(
    rawOrders.map((order) => expireHoldIfNeeded(supabase, order))
  );

  return (
    <OrderManagementView
      initialOrders={reconciledOrders}
      adminId={user.id}
    />
  );
}
