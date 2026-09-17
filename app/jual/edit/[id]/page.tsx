import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSeller } from "@/lib/supabase/guards";
import type { Category, ProductWithCategory } from "@/lib/types/database";
import { ProductForm } from "../../product-form";

export default async function EditProdukPage({
  params,
}: PageProps<"/jual/edit/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireSeller(supabase, `/jual/edit/${id}`);

  const { data: product } = await supabase
    .from("products")
    .select("*, kategori:categories(id, nama_kategori)")
    .eq("id", id)
    .single();

  if (!product || product.seller_id !== user.id || product.status !== "Tersedia") {
    redirect("/jual?error=cannot-edit");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, nama_kategori")
    .order("nama_kategori", { ascending: true });

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Edit Produk
      </h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Perbarui detail produkmu.
      </p>

      <ProductForm
        mode="edit"
        product={product as ProductWithCategory}
        categories={(categories as Category[]) ?? []}
        sellerId={user.id}
        defaultLat={profile.lat}
        defaultLng={profile.lng}
      />
    </div>
  );
}
