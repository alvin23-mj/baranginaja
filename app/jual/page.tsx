import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSeller } from "@/lib/supabase/guards";
import type { ProductWithCategory } from "@/lib/types/database";
import { ProductList } from "./product-list";

export default async function JualPage() {
  const supabase = await createClient();
  const { user } = await requireSeller(supabase, "/jual");

  const { data: products } = await supabase
    .from("products")
    .select("*, kategori:categories(id, nama_kategori)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Produk Saya
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Kelola produk yang kamu jual.
          </p>
        </div>
        <Link
          href="/jual/tambah"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Tambah Produk
        </Link>
      </div>

      <Suspense fallback={null}>
        <ProductList products={(products as ProductWithCategory[]) ?? []} />
      </Suspense>
    </div>
  );
}
