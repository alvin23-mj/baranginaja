import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/pricing";
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  expireHoldIfNeeded,
} from "@/lib/orders";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import type { OrderWithProduct } from "@/lib/types/database";
import { OrderCountdown } from "./order-countdown";

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
    redirect(`/login?redirectTo=/order/${id}`);
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

  const order = await expireHoldIfNeeded(supabase, orderData as OrderWithProduct);
  const product = order.product;

  const waLink =
    order.status === "Menunggu Pembayaran" && product?.seller
      ? buildOrderWhatsAppLink({
          sellerPhone: product.seller.no_hp,
          namaBarang: product.nama_barang,
          productId: product.id,
          namaPenjual: product.seller.nama_lengkap,
          opsiPengiriman: order.opsi_pengiriman,
          totalHarga: order.total_harga,
          orderId: order.id,
        })
      : null;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Detail Pesanan
      </h1>

      <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex gap-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
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
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {product?.nama_barang ?? "Produk tidak ditemukan"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {order.opsi_pengiriman === "cod"
                ? "COD / Ambil Sendiri"
                : "Kurir Platform"}
            </p>
            <p className="text-base font-bold text-zinc-950 dark:text-zinc-50">
              {formatRupiah(order.total_harga)}
            </p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[order.status]}`}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>

        {order.opsi_pengiriman === "kurir" &&
          order.jarak_km != null &&
          order.ongkir != null && (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              Jarak: <span className="font-medium text-zinc-950 dark:text-zinc-50">{order.jarak_km.toFixed(2)} km</span>, Berat: <span className="font-medium text-zinc-950 dark:text-zinc-50">{product?.berat_kg ?? "-"} kg</span>
              {" → "}Ongkir: <span className="font-semibold text-zinc-950 dark:text-zinc-50">{formatRupiah(order.ongkir)}</span>
            </div>
          )}

        {order.status === "Menunggu Pembayaran" && order.hold_expires_at && (
          <OrderCountdown holdExpiresAt={order.hold_expires_at} />
        )}

        {order.status === "Menunggu Pembayaran" && waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-full items-center justify-center rounded-md bg-emerald-600 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Konfirmasi via WhatsApp
          </a>
        )}

        {order.status === "Dibatalkan" && (
          <div className="flex flex-col gap-3">
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              Waktu pembayaran habis, pesanan dibatalkan.
            </p>
            <Link
              href="/produk"
              className="flex h-11 w-full items-center justify-center rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Kembali ke Listing Produk
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
