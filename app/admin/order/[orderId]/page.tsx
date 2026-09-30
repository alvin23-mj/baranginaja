import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import { formatRupiah } from "@/lib/pricing";
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  expireHoldIfNeeded,
} from "@/lib/orders";
import type { AdminOrderDetail } from "@/lib/types/database";
import { AdminOrderActions } from "./admin-order-actions";

const ORDER_SELECT =
  "*, product:products(id, nama_barang, foto_urls, berat_kg, harga_input, seller:users(id, nama_lengkap, no_hp)), buyer:users!buyer_id(id, nama_lengkap, no_hp)";

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/order/[orderId]">) {
  const { orderId } = await params;
  const supabase = await createClient();
  const { user } = await requireAdmin(supabase, `/admin/order/${orderId}`);

  const { data: orderData } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .single();

  if (!orderData) {
    notFound();
  }

  const order = await expireHoldIfNeeded(
    supabase,
    orderData as AdminOrderDetail
  );
  const product = order.product;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Kembali ke Dashboard Order
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Detail Order
      </h1>

      <div className="flex flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {product?.foto_urls[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.foto_urls[0]}
                  alt={product.nama_barang}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col justify-center gap-1">
              <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {product?.nama_barang ?? "Produk dihapus"}
              </p>
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                {formatRupiah(order.total_harga)}
              </p>
            </div>
          </div>
          <span
            className={`w-fit shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[order.status]}`}
          >
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Pembeli</p>
            <p className="font-medium text-zinc-950 dark:text-zinc-50">
              {order.buyer?.nama_lengkap ?? "-"}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              {order.buyer?.no_hp ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Penjual</p>
            <p className="font-medium text-zinc-950 dark:text-zinc-50">
              {product?.seller?.nama_lengkap ?? "-"}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              {product?.seller?.no_hp ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Opsi Pengiriman</p>
            <p className="font-medium text-zinc-950 dark:text-zinc-50">
              {order.opsi_pengiriman === "cod"
                ? "COD / Ambil Sendiri"
                : "Kurir Platform"}
            </p>
          </div>
          {order.opsi_pengiriman === "kurir" && (
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Jarak / Ongkir</p>
              <p className="font-medium text-zinc-950 dark:text-zinc-50">
                {order.jarak_km != null ? `${order.jarak_km.toFixed(2)} km` : "-"}
                {" → "}
                {order.ongkir != null ? formatRupiah(order.ongkir) : "-"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <p className="font-medium text-zinc-950 dark:text-zinc-50">
            Riwayat Waktu
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Dibuat: {new Date(order.created_at).toLocaleString("id-ID")}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Dibayar:{" "}
            {order.paid_at
              ? new Date(order.paid_at).toLocaleString("id-ID")
              : "-"}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Selesai:{" "}
            {order.completed_at
              ? new Date(order.completed_at).toLocaleString("id-ID")
              : "-"}
          </p>
        </div>

        <AdminOrderActions order={order} adminId={user.id} />
      </div>
    </div>
  );
}
