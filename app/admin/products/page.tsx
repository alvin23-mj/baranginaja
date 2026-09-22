import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import type { Category, UserRow } from "@/lib/types/database";
import { ProductManagement } from "./product-management";
import type { AdminProductListItem } from "./product-modals";

function paramStr(val: unknown): string {
  return typeof val === "string" ? val.trim() : "";
}

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const params = await searchParams;
  const supabase = await createClient();
  await requireAdmin(supabase, "/admin/products");

  const q = paramStr(params.q);
  const kategoriParam = paramStr(params.kategori);
  const bulanParam = paramStr(params.bulan);

  // Build products query
  let productsQuery = supabase
    .from("products")
    .select("*, kategori:categories(id, nama_kategori), seller:users!products_seller_id_fkey(id, nama_lengkap, email, no_hp)")
    .order("created_at", { ascending: false });

  if (kategoriParam) {
    productsQuery = productsQuery.eq("kategori_id", kategoriParam);
  }

  // Execute all 3 database queries in parallel for fast server response
  const [{ data: categoriesData }, { data: sellersData }, { data: productsData, error }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, nama_kategori")
        .order("nama_kategori", { ascending: true }),

      supabase
        .from("users")
        .select("id, nama_lengkap, email, no_hp, status_verifikasi, role, is_seller, no_rekening, nama_bank, nama_pemilik_rekening, alamat_kos, lat, lng")
        .order("nama_lengkap", { ascending: true }),

      productsQuery,
    ]);

  const categories = (categoriesData as Category[]) ?? [];
  const sellers = (sellersData as UserRow[]) ?? [];

  if (error) {
    console.error("Failed to fetch products for admin:", error);
  }

  let products = (productsData as AdminProductListItem[]) ?? [];

  // Filter by Month if bulanParam is specified (e.g. "01" .. "12")
  if (bulanParam) {
    products = products.filter((p) => {
      if (!p.created_at) return false;
      const date = new Date(p.created_at);
      const monthNumStr = String(date.getMonth() + 1).padStart(2, "0");
      return monthNumStr === bulanParam || p.created_at.startsWith(bulanParam);
    });
  }

  // Filter by search query q
  if (q) {
    const qLower = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.nama_barang.toLowerCase().includes(qLower) ||
        p.seller?.nama_lengkap?.toLowerCase().includes(qLower) ||
        p.seller?.email?.toLowerCase().includes(qLower)
    );
  }

  return (
    <ProductManagement
      initialProducts={products}
      categories={categories}
      sellers={sellers}
    />
  );
}
