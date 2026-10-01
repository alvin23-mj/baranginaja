import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSeller } from "@/lib/supabase/guards";
import type { Category, ProductWithCategory } from "@/lib/types/database";
import { ProductForm } from "../../product-form";

export const metadata = {
  title: "Edit Produk - BaranginAja",
  description: "Ubah nama, harga, deskripsi, dan informasi barang jualanmu.",
};

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
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-10">
      <Link
        href="/jual"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Kembali ke Produk Saya
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
        Edit Produk
      </h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Perbarui nama barang, harga, foto, atau detail lainnya selama barang belum terjual.
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
