import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { expireHoldIfNeeded } from "@/lib/orders";
import type { OrderWithProduct } from "@/lib/types/database";

const ORDER_SELECT =
  "*, product:products(id, nama_barang, foto_urls, berat_kg, seller:users(id, nama_lengkap, no_hp))";

export default async function OrderDetailPage({
  params,
}: PageProps<"/order/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?redirectTo=/jual?view=pembeli&orderId=${id}`);
  }

  const { data: orderData } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .single();

  if (!orderData) {
    notFound();
  }

  if ((orderData as OrderWithProduct).buyer_id !== authUser.id) {
    notFound();
  }

  await expireHoldIfNeeded(supabase, orderData as OrderWithProduct);
  redirect(`/jual?view=pembeli&orderId=${id}`);
}
