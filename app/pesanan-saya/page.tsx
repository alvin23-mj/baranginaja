import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/pricing";
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL, expireHoldIfNeeded } from "@/lib/orders";
import type { OrderListItem } from "@/lib/types/database";

const ORDER_SELECT = "*, product:products(id, nama_barang, foto_urls)";

export default async function PesananSayaPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirectTo=/pesanan-saya");
  }

  const { data: ordersData } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("buyer_id", authUser.id)
    .order("created_at", { ascending: false });

  const orders = await Promise.all(
    ((ordersData as OrderListItem[]) ?? []).map((order) =>
      expireHoldIfNeeded(supabase, order)
    )
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Pesanan Saya
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Belum ada pesanan
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Temukan barang bekas murah dan berkualitas dari sesama di sekitarmu di Surabaya.
            </p>
          </div>
          <Link
            href="/produk"
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.id}`}
              className="flex gap-3.5 rounded-lg border border-zinc-200 bg-white p-3.5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                {order.product?.foto_urls[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.product.foto_urls[0]}
                    alt={order.product.nama_barang}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {order.product?.nama_barang ?? "Produk dihapus"}
                </p>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {formatRupiah(order.total_harga)}
                </p>
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[order.status]}`}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
