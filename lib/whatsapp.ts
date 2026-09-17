import { formatRupiah } from "@/lib/pricing";
import type { ShippingOption } from "@/lib/types/database";

export function normalizeIndonesianPhoneForWhatsApp(rawPhone: string): string {
  const digits = rawPhone.replace(/[^0-9]/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

const OPSI_PENGIRIMAN_LABEL: Record<ShippingOption, string> = {
  cod: "COD / Ambil Sendiri",
  kurir: "Kurir Platform",
};

export function buildOrderWhatsAppLink({
  sellerPhone,
  namaBarang,
  productId,
  namaPenjual,
  opsiPengiriman,
  totalHarga,
  orderId,
}: {
  sellerPhone: string;
  namaBarang: string;
  productId: string;
  namaPenjual: string;
  opsiPengiriman: ShippingOption;
  totalHarga: number;
  orderId: string;
}): string {
  const message = [
    `Halo ${namaPenjual}, saya mau konfirmasi pesanan di BaranginAja:`,
    "",
    `Barang: ${namaBarang} (ID: ${productId})`,
    `Opsi pengiriman: ${OPSI_PENGIRIMAN_LABEL[opsiPengiriman]}`,
    `Total: ${formatRupiah(totalHarga)}`,
    `ID Pesanan: ${orderId}`,
    "",
    "Mohon konfirmasi ya, terima kasih.",
  ].join("\n");

  const phone = normalizeIndonesianPhoneForWhatsApp(sellerPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
