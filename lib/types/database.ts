export interface District {
  id: string | number;
  nama_kecamatan: string;
  kota?: string;
  aktif?: boolean;
}

export interface Campus {
  id: string | number;
  nama_kampus: string;
  aktif: boolean;
}

export interface UserRow {
  id: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  kecamatan_id?: string | number | null;
  kampus_id?: string | number | null;
  alamat_kos: string | null;
  lat: number | null;
  lng: number | null;
  status_verifikasi: "pending" | "verified" | "rejected";
  role: "buyer" | "seller" | "admin";
  is_seller: boolean;
  no_rekening: string | null;
  nama_bank: string | null;
  nama_pemilik_rekening: string | null;
}

export interface UserWithDistrict extends UserRow {
  kecamatan?: Pick<District, "id" | "nama_kecamatan"> | null;
  kampus?: Pick<Campus, "id" | "nama_kampus"> | null;
}

export interface UserWithKampus extends UserRow {
  kecamatan?: Pick<District, "id" | "nama_kecamatan"> | null;
  kampus: Pick<Campus, "id" | "nama_kampus"> | null;
}

// Assumed schema — no migration/types existed for this table yet.
// Adjust table/column names here if the real `categories` schema differs.
export interface Category {
  id: string;
  nama_kategori: string;
}

export type ProductCondition =
  | "Baru"
  | "Bekas - Layak Pakai"
  | "Bekas - Ada Cacat Minor";

export type ProductStatus = "Tersedia" | "Dipesan" | "Terjual";

// Assumed schema — no migration/types existed for this table yet.
// Adjust table/column names here if the real `products` schema differs.
export interface ProductRow {
  id: string;
  seller_id: string;
  nama_barang: string;
  deskripsi: string | null;
  kategori_id: string;
  kondisi: ProductCondition;
  harga_input: number;
  harga_jual: number;
  berat_kg: number;
  foto_urls: string[];
  lat: number | null;
  lng: number | null;
  status: ProductStatus;
  created_at: string;
}

export interface ProductWithCategory extends ProductRow {
  kategori: Pick<Category, "id" | "nama_kategori"> | null;
}

export interface ProductSeller {
  id: string;
  nama_lengkap: string;
  status_verifikasi: UserRow["status_verifikasi"];
  kecamatan_id?: string | number | null;
  kecamatan?: Pick<District, "id" | "nama_kecamatan"> | null;
  kampus_id?: string | number | null;
  kampus?: Pick<Campus, "id" | "nama_kampus"> | null;
}

export interface ProductWithSeller extends ProductRow {
  kategori: Pick<Category, "id" | "nama_kategori"> | null;
  seller: ProductSeller | null;
}

export type ShippingOption = "cod" | "kurir";

export type OrderStatus =
  | "Menunggu Pembayaran"
  | "Dibayar"
  | "Dijemput"
  | "Dalam Pengiriman"
  | "Diterima"
  | "Selesai"
  | "Dibatalkan";

// Assumed schema — no migration/types existed for this table yet.
// Adjust table/column names here if the real `orders` schema differs.
export interface OrderRow {
  id: string;
  product_id: string;
  buyer_id: string;
  opsi_pengiriman: ShippingOption;
  jarak_km: number | null;
  ongkir: number | null;
  total_harga: number;
  status: OrderStatus;
  bukti_bayar_url: string | null;
  hold_expires_at: string | null;
  dikonfirmasi_diterima_at: string | null;
  admin_id: string | null;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
}

export interface OrderSellerInfo {
  id: string;
  nama_lengkap: string;
  no_hp: string;
}

export interface OrderProduct {
  id: string;
  nama_barang: string;
  foto_urls: string[];
  berat_kg: number;
  seller: OrderSellerInfo | null;
}

export interface OrderWithProduct extends OrderRow {
  product: OrderProduct | null;
}

export interface OrderListItem extends OrderRow {
  product: Pick<OrderProduct, "id" | "nama_barang" | "foto_urls"> | null;
}

// Assumed schema — no migration/types existed for this table yet.
// Adjust table/column names here if the real `activity_logs` schema differs.
export interface ActivityLogRow {
  id: string;
  admin_id: string;
  order_id: string;
  aksi: string;
  timestamp: string;
}

export interface AdminOrderProduct {
  id: string;
  nama_barang: string;
  foto_urls: string[];
  berat_kg: number;
  harga_input: number;
  seller: OrderSellerInfo | null;
}

export interface AdminOrderListItem extends OrderRow {
  product: Pick<AdminOrderProduct, "id" | "nama_barang"> | null;
  buyer: OrderSellerInfo | null;
}

export interface AdminOrderDetail extends OrderRow {
  product: AdminOrderProduct | null;
  buyer: OrderSellerInfo | null;
}

export type PayoutStatus = "menunggu" | "dicairkan";

// Assumed schema — no migration/types existed for this table yet.
// Adjust table/column names here if the real `payouts` schema differs.
export interface PayoutRow {
  id: string;
  order_id: string;
  seller_id: string;
  nominal: number;
  status: PayoutStatus;
  tanggal_dicairkan: string | null;
}

export interface PayoutSeller {
  id: string;
  nama_lengkap: string;
  no_rekening: string | null;
  nama_bank: string | null;
  nama_pemilik_rekening: string | null;
}

export interface PayoutOrder {
  id: string;
  created_at: string;
  product: { nama_barang: string } | null;
}

export interface AdminPayoutListItem extends PayoutRow {
  order: PayoutOrder | null;
  seller: PayoutSeller | null;
}

export interface SellerPayoutListItem extends PayoutRow {
  order: { product: { nama_barang: string } | null } | null;
}

export interface ActivityLogWithDetails extends ActivityLogRow {
  admin: { nama_lengkap: string } | null;
  order: {
    id: string;
    product: { nama_barang: string } | null;
  } | null;
}

export interface AdminUserListItem extends UserRow {
  kecamatan?: Pick<District, "id" | "nama_kecamatan"> | null;
  kampus: Pick<Campus, "id" | "nama_kampus"> | null;
}
