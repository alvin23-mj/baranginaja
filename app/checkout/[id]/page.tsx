import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./checkout-form";

const CHECKOUT_PRODUCT_SELECT =
  "id, seller_id, nama_barang, harga_jual, berat_kg, foto_urls, lat, lng, status";

interface CheckoutProduct {
  id: string;
  seller_id: string;
  nama_barang: string;
  harga_jual: number;
  berat_kg: number;
  foto_urls: string[];
  lat: number | null;
  lng: number | null;
  status: string;
}

export default async function CheckoutPage({
  params,
}: PageProps<"/checkout/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?redirectTo=/checkout/${id}`);
  }

  const { data: productData } = await supabase
    .from("products")
    .select(CHECKOUT_PRODUCT_SELECT)
    .eq("id", id)
    .single();

  if (!productData) {
    redirect("/produk");
  }

  const product = productData as CheckoutProduct;

  if (product.seller_id === authUser.id) {
    redirect(`/produk/${id}?checkout_error=own_product`);
  }

  if (product.status !== "Tersedia") {
    redirect(`/produk/${id}?checkout_error=unavailable`);
  }

  const { data: buyerProfile } = await supabase
    .from("users")
    .select("alamat_kos, lat, lng")
    .eq("id", authUser.id)
    .single();

  const buyerAddressComplete = Boolean(
    buyerProfile?.alamat_kos && buyerProfile?.lat != null && buyerProfile?.lng != null
  );

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Checkout
      </h1>

      <CheckoutForm
        product={product}
        buyerId={authUser.id}
        buyerLat={buyerProfile?.lat ?? null}
        buyerLng={buyerProfile?.lng ?? null}
        buyerAddressComplete={buyerAddressComplete}
      />
    </div>
  );
}
