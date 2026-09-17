"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateOngkir, formatRupiah } from "@/lib/pricing";
import { haversineDistanceKm } from "@/lib/geo";
import { computeHoldExpiresAt } from "@/lib/orders";
import type { ShippingOption } from "@/lib/types/database";

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

export function CheckoutForm({
  product,
  buyerId,
  buyerLat,
  buyerLng,
  buyerAddressComplete,
}: {
  product: CheckoutProduct;
  buyerId: string;
  buyerLat: number | null;
  buyerLng: number | null;
  buyerAddressComplete: boolean;
}) {
  const router = useRouter();
  const [opsiPengiriman, setOpsiPengiriman] = useState<ShippingOption>("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canKurir =
    buyerAddressComplete && product.lat != null && product.lng != null;

  const jarakKm =
    canKurir && buyerLat != null && buyerLng != null
      ? haversineDistanceKm(buyerLat, buyerLng, product.lat!, product.lng!)
      : null;

  const ongkir =
    jarakKm != null ? calculateOngkir(jarakKm, product.berat_kg) : null;

  const totalHarga =
    opsiPengiriman === "kurir" && ongkir
      ? product.harga_jual + ongkir.ongkirFinal
      : product.harga_jual;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError(null);
    setLoading(true);
    const supabase = createClient();
    const holdExpiresAt = computeHoldExpiresAt();

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({ status: "Dipesan" })
      .eq("id", product.id)
      .eq("status", "Tersedia")
      .select("id")
      .single();

    if (updateError || !updatedProduct) {
      setLoading(false);
      setError("Produk sudah dipesan orang lain.");
      return;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        product_id: product.id,
        buyer_id: buyerId,
        opsi_pengiriman: opsiPengiriman,
        jarak_km: opsiPengiriman === "kurir" ? jarakKm : null,
        ongkir: opsiPengiriman === "kurir" ? ongkir?.ongkirFinal ?? null : null,
        total_harga: totalHarga,
        status: "Menunggu Pembayaran",
        hold_expires_at: holdExpiresAt,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      await supabase
        .from("products")
        .update({ status: "Tersedia" })
        .eq("id", product.id)
        .eq("status", "Dipesan");

      setLoading(false);
      setError("Gagal membuat pesanan. Coba lagi.");
      return;
    }

    router.push(`/order/${order.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
          {product.foto_urls[0] && (
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
            {product.nama_barang}
          </p>
          <p className="text-base font-bold text-zinc-950 dark:text-zinc-50">
            {formatRupiah(product.harga_jual)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          Opsi Pengiriman
        </span>

        <label
          className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors ${
            opsiPengiriman === "cod"
              ? "border-blue-600 bg-blue-50/40 text-blue-950 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-100"
              : "border-zinc-200 text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
          }`}
        >
          <input
            type="radio"
            name="opsi_pengiriman"
            value="cod"
            checked={opsiPengiriman === "cod"}
            onChange={() => setOpsiPengiriman("cod")}
            className="h-4 w-4 accent-blue-600"
          />
          <div>
            <span className="font-medium">COD / Ambil Sendiri</span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ketemu langsung di lokasi yang disepakati (Gratis)
            </p>
          </div>
        </label>

        <label
          className={`flex items-center gap-3 rounded-md border p-3 text-sm transition-colors ${
            !canKurir
              ? "cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
              : opsiPengiriman === "kurir"
              ? "cursor-pointer border-blue-600 bg-blue-50/40 text-blue-950 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-100"
              : "cursor-pointer border-zinc-200 text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
          }`}
        >
          <input
            type="radio"
            name="opsi_pengiriman"
            value="kurir"
            checked={opsiPengiriman === "kurir"}
            disabled={!canKurir}
            onChange={() => setOpsiPengiriman("kurir")}
            className="h-4 w-4 accent-blue-600"
          />
          <div>
            <span className="font-medium">Kurir Platform</span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Diantar kurir resmi sampai ke alamat tujuan kamu
            </p>
          </div>
        </label>

        {!buyerAddressComplete && (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
            <Link href="/profil" className="font-semibold underline">
              Lengkapi alamat & lokasi domisili di profil
            </Link>{" "}
            untuk bisa menggunakan Kurir Platform.
          </p>
        )}
        {buyerAddressComplete && (product.lat == null || product.lng == null) && (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
            Lokasi produk belum tersedia, Kurir Platform tidak dapat digunakan.
          </p>
        )}

        {opsiPengiriman === "kurir" && jarakKm != null && ongkir != null && (
          <div className="rounded-md border border-blue-100 bg-blue-50/50 p-3 text-xs text-zinc-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-zinc-300">
            <p>
              Estimasi Jarak: <span className="font-medium text-zinc-950 dark:text-zinc-50">{jarakKm.toFixed(2)} km</span> · Berat: <span className="font-medium text-zinc-950 dark:text-zinc-50">{product.berat_kg} kg</span>
            </p>
            <p className="mt-1 font-semibold text-blue-700 dark:text-blue-400">
              Ongkir: {formatRupiah(ongkir.ongkirFinal)}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
          <span className="font-medium">Total Pembayaran</span>
          <span className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
            {formatRupiah(totalHarga)}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Membuat pesanan..." : "Buat Pesanan"}
      </button>
    </form>
  );
}
