import { createClient } from "@/lib/supabase/server";
import { requireSeller } from "@/lib/supabase/guards";
import type { Category } from "@/lib/types/database";
import { ProductForm } from "../product-form";

export default async function TambahProdukPage() {
  const supabase = await createClient();
  const { user, profile } = await requireSeller(supabase, "/jual/tambah");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, nama_kategori")
    .order("nama_kategori", { ascending: true });

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Tambah Produk
      </h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Isi detail produk yang ingin kamu jual.
      </p>

      <ProductForm
        mode="create"
        categories={(categories as Category[]) ?? []}
        sellerId={user.id}
        defaultLat={profile.lat}
        defaultLng={profile.lng}
      />
    </div>
  );
}
