# BaranginAja — Konteks Project

## Stack
Next.js (App Router) + TailwindCSS, Supabase (Auth + Postgres + Storage).

## Skema data (Supabase)
- users: id, nama_lengkap, email, no_hp, kampus_id (FK), alamat_kos, lat, lng,
  status_verifikasi (pending/verified), is_seller (bool), no_rekening, nama_bank,
  nama_pemilik_rekening, role (buyer/seller/admin)
- campuses: id, nama_kampus, kota, aktif
- categories: id, nama_kategori
- products: id, seller_id (FK), kategori_id (FK), nama_barang, deskripsi, kondisi,
  harga_input, harga_jual, berat_kg, foto_urls[], lat, lng, status (Tersedia/Dipesan/Terjual)
- orders: id, product_id (FK), buyer_id (FK), opsi_pengiriman (cod/kurir), jarak_km,
  ongkir, total_harga, status, bukti_bayar_url, hold_expires_at, dikonfirmasi_diterima_at,
  admin_id, created_at, paid_at, completed_at
- payouts: id, order_id (FK), seller_id (FK), nominal, status (menunggu/dicairkan), tanggal_dicairkan
- activity_logs: id, admin_id, order_id, aksi, timestamp

## Business rules — WAJIB diikuti persis

### Markup harga jual
| Tier | Kondisi Harga Input Penjual | Markup Platform |
|---|---|---|
| 1 | < Rp 100.000 | +12% |
| 2 | ≥ Rp 100.000 dan < Rp 500.000 | +10% |
| 3 | ≥ Rp 500.000 | +8% |

**Formula:**
```
harga_jual_tampil = harga_input_penjual × (1 + markup%)
fee_platform = harga_jual_tampil − harga_input_penjual
```

**Contoh perhitungan:**

| Harga Input Penjual | Tier | Markup | Harga Tampil di Katalog | Fee Platform |
|---|---|---|---|---|
| Rp 35.000 | 1 | 12% | Rp 39.200 | Rp 4.200 |
| Rp 99.000 | 1 | 12% | Rp 110.880 | Rp 11.880 |
| Rp 100.000 | 2 | 10% | Rp 110.000 | Rp 10.000 |
| Rp 499.000 | 2 | 10% | Rp 548.900 | Rp 48.900 |
| Rp 500.000 | 3 | 8% | Rp 540.000 | Rp 40.000 |

### Ongkir (opsi kurir)
- ongkir_raw = (jarak_km * 2500) + (berat_kg * 5000)
- ongkir_final = round up ongkir_raw ke kelipatan terdekat 5000

### Total checkout
- COD/Ambil Sendiri: total = harga_jual
- Kurir Platform: total = harga_jual + ongkir_final

### Pencairan dana ke penjual
Nominal payout = harga_input (BUKAN harga_jual, markup & ongkir adalah revenue platform)

### State machine produk
Tersedia → Dipesan (Pending, hold timer 30-60 menit) → Terjual
Dipesan → Tersedia (jika hold timer habis tanpa pembayaran)

### State machine order
Menunggu Pembayaran → Dibayar → (COD: Selesai) / (Kurir: Dijemput → Dalam Pengiriman → Diterima → Selesai)
Dari status manapun sebelum Dibayar bisa jadi Dibatalkan

## Catatan penting
- Tidak ada payment gateway otomatis. Checkout diarahkan ke wa.me dengan template pesan berisi nama_barang, id_barang, nama_penjual, opsi_pengiriman, total_harga, id_order.
- Verifikasi kampus MVP = self-declared dropdown saja, tanpa upload dokumen.
- Satu akun bisa dual-role buyer & seller.