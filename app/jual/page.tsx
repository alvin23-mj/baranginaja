import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSeller } from "@/lib/supabase/guards";
import { findDistrictName } from "@/lib/districts";
import { formatRupiah } from "@/lib/pricing";
import type { ProductWithCategory } from "@/lib/types/database";

export default async function JualPage() {
  const supabase = await createClient();
  const { user } = await requireSeller(supabase, "/jual");

  const [{ data: products }, { data: profile }] = await Promise.all([
    supabase
      .from("products")
      .select("*, kategori:categories(id, nama_kategori)")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("users")
      .select("nama_lengkap, kecamatan_id, kecamatan:districts(nama_kecamatan)")
      .eq("id", user.id)
      .single(),
  ]);

  const districtName =
    (profile?.kecamatan as unknown as { nama_kecamatan: string } | null)?.nama_kecamatan ??
    findDistrictName(profile?.kecamatan_id) ??
    null;

  const allProducts = (products as ProductWithCategory[]) ?? [];
  const tersedia = allProducts.filter((p) => p.status === "Tersedia");
  const dipesan  = allProducts.filter((p) => p.status === "Dipesan");
  const terjual  = allProducts.filter((p) => p.status === "Terjual");

  const fullName  = profile?.nama_lengkap ?? "Penjual";
  const firstName = fullName.split(" ")[0];
  const initials  = fullName.split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("");

  const navItems = [
    { label: "Ringkasan toko", href: "/jual",           active: true  },
    { label: "Produk saya",    href: "/jual/produk",    active: false },
    { label: "Pendapatan",     href: "/jual/pendapatan",active: false },
    { label: "Tambah produk",  href: "/jual/tambah",    active: false },
    { label: "Pengaturan",     href: "/profil",          active: false },
  ];

  const stats = [
    { label: "Tersedia",     count: tersedia.length      },
    { label: "Dipesan",      count: dipesan.length       },
    { label: "Terjual",      count: terjual.length       },
    { label: "Total produk", count: allProducts.length   },
  ];

  return (
    <main className="flex-1 bg-zinc-100 min-h-screen py-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="flex overflow-hidden rounded-2xl bg-white border border-zinc-200 shadow-sm">

          {/* Sidebar */}
          <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-zinc-100 p-5">
            <div className="flex items-center gap-3 mb-7">
              <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 select-none">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{fullName}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {districtName ? `Kec. ${districtName}` : "Penjual"}
                </p>
              </div>
            </div>
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
                  }`}
                >
                  <span className={`h-3.5 w-3.5 rounded border shrink-0 ${
                    item.active ? "border-blue-400 bg-blue-200" : "border-zinc-300"
                  }`} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">Halo, {firstName}</h1>

            {/* Stats 4 boxes */}
            <div className="grid grid-cols-4 divide-x divide-zinc-100 border border-zinc-100 rounded-xl mb-6 overflow-hidden">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center py-5 px-3 gap-1.5 bg-zinc-50">
                  <span className="h-4 w-4 rounded border border-zinc-300 bg-white block mb-0.5" />
                  <span className="text-2xl font-bold text-zinc-900 leading-none">{s.count}</span>
                  <span className="text-xs text-zinc-500 text-center">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Produk tersedia card */}
            <div className="rounded-xl border border-zinc-200 p-4 mb-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-zinc-900">Produk tersedia</p>
                <Link href="/jual/produk" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">Lihat semua</Link>
              </div>
              {tersedia.length === 0 ? (
                <p className="text-sm text-zinc-400 py-4 text-center">Belum ada produk tersedia.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {tersedia.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded border border-zinc-300 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">{p.nama_barang}</p>
                        <p className="text-xs text-zinc-400">{formatRupiah(p.harga_jual)}</p>
                      </div>
                      <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full shrink-0">Tersedia</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link href="/jual/tambah" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                  + Tambah produk
                </Link>
              </div>
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-zinc-900">Dipesan</p>
                  {dipesan.length > 0 && (
                    <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{dipesan.length}</span>
                  )}
                </div>
                {dipesan.length === 0 ? (
                  <div className="flex items-center gap-2 py-3">
                    {[0,1,2].map((i) => <span key={i} className="h-10 w-10 rounded border border-zinc-200 bg-zinc-50 block" />)}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {dipesan.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        {p.foto_urls[0]
                          ? <img src={p.foto_urls[0]} alt={p.nama_barang} className="h-9 w-9 rounded object-cover shrink-0 border border-zinc-100" />
                          : <span className="h-9 w-9 rounded border border-zinc-200 bg-zinc-50 block shrink-0" />}
                        <p className="text-xs text-zinc-600 truncate">{p.nama_barang}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-zinc-900">Terjual</p>
                  {terjual.length > 0 && (
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{terjual.length}</span>
                  )}
                </div>
                {terjual.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-3">Belum ada produk terjual.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {terjual.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <p className="text-xs text-zinc-700 truncate flex-1">{p.nama_barang}</p>
                        <p className="text-xs font-semibold text-zinc-500 shrink-0">{formatRupiah(p.harga_jual)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
