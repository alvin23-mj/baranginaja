import type { SupabaseClient } from "@supabase/supabase-js";
import type { District } from "./types/database";

export const KECAMATAN_SURABAYA: { id: number; nama_kecamatan: string }[] = [
  { id: 1, nama_kecamatan: "Asemrowo" },
  { id: 2, nama_kecamatan: "Benowo" },
  { id: 3, nama_kecamatan: "Bubutan" },
  { id: 4, nama_kecamatan: "Bulak" },
  { id: 5, nama_kecamatan: "Dukuh Pakis" },
  { id: 6, nama_kecamatan: "Gayungan" },
  { id: 7, nama_kecamatan: "Genteng" },
  { id: 8, nama_kecamatan: "Gubeng" },
  { id: 9, nama_kecamatan: "Gunung Anyar" },
  { id: 10, nama_kecamatan: "Jambangan" },
  { id: 11, nama_kecamatan: "Karangpilang" },
  { id: 12, nama_kecamatan: "Kenjeran" },
  { id: 13, nama_kecamatan: "Krembangan" },
  { id: 14, nama_kecamatan: "Lakarsantri" },
  { id: 15, nama_kecamatan: "Mulyorejo" },
  { id: 16, nama_kecamatan: "Pabean Cantian" },
  { id: 17, nama_kecamatan: "Pakal" },
  { id: 18, nama_kecamatan: "Rungkut" },
  { id: 19, nama_kecamatan: "Sambikerep" },
  { id: 20, nama_kecamatan: "Sawahan" },
  { id: 21, nama_kecamatan: "Semampir" },
  { id: 22, nama_kecamatan: "Simokerto" },
  { id: 23, nama_kecamatan: "Sukolilo" },
  { id: 24, nama_kecamatan: "Sukomanunggal" },
  { id: 25, nama_kecamatan: "Tambaksari" },
  { id: 26, nama_kecamatan: "Tandes" },
  { id: 27, nama_kecamatan: "Tegalsari" },
  { id: 28, nama_kecamatan: "Tenggilis Mejoyo" },
  { id: 29, nama_kecamatan: "Wiyung" },
  { id: 30, nama_kecamatan: "Wonocolo" },
  { id: 31, nama_kecamatan: "Wonokromo" },
];

export async function getDistricts(supabase?: SupabaseClient): Promise<District[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("districts")
        .select("id, nama_kecamatan, aktif")
        .eq("aktif", true)
        .order("nama_kecamatan", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as District[];
      }
    } catch {
      // Fallback to static list
    }
  }

  return KECAMATAN_SURABAYA.map((d) => ({
    id: String(d.id),
    nama_kecamatan: d.nama_kecamatan,
    aktif: true,
  }));
}

export function findDistrictName(districtId?: string | number | null): string | null {
  if (!districtId) return null;
  const match = KECAMATAN_SURABAYA.find((d) => String(d.id) === String(districtId));
  return match ? match.nama_kecamatan : null;
}
