# 📦 BaranginAja — Platform Jual Beli Barang Bekas Antar Mahasiswa Kos (Surabaya)

<p align="center">
  <img src="public/logo.png" alt="BaranginAja Logo" width="120" />
</p>

<p align="center">
  <strong>Solusi E-Commerce & Sistem Informasi Manajemen (SIM) Hyper-Local Khusus Mahasiswa Kos se-Surabaya</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase PostgreSQL" />
</p>

---

## 📌 Ringkasan Produk

**BaranginAja** adalah platform e-commerce dan Sistem Informasi Manajemen (SIM) yang dirancang khusus untuk memfasilitasi transaksi jual-beli barang bekas (perabotan kos, elektronik, buku kuliah, alat rumah tangga) antar mahasiswa kos se-Surabaya (berbasis 31 Kecamatan Surabaya).

Berbeda dari marketplace umum, BaranginAja mengusung pendekatan **hyper-local berbasis wilayah & kampus** dengan sistem transaksi terstruktur yang diawasi langsung oleh **SIM Admin Operasional** (menggunakan metode pembayaran QRIS & verifikasi otomatis via WhatsApp).

### 💡 Model Bisnis & Value Proposition
1. **Harga Transparan (Markup Otomatis):** Sistem secara otomatis menambahkan komisi platform (8%–12%) di atas harga input asli penjual.
2. **Fleksibilitas Pengiriman:** 
   - **Ambil Mandiri (COD Kos):** Bebas ongkir, pembeli mengambil langsung ke kos/domisili penjual.
   - **Kurir Internal Platform:** Perhitungan ongkos kirim otomatis berbasis jarak kilometer (km) antar kecamatan/kos.
3. **Proteksi Hold Stok 15 Menit:** Menghindari *double order* dengan sistem penguncian stok sementara saat pembeli memicu pesanan via WhatsApp.
4. **Pencairan Dana (Payout) Pasti:** Penjual menerima 100% dari harga input asli barang setelah pesanan diverifikasi dan diselesaikan oleh admin.

---

## 🔥 Fitur Utama

### 🛒 1. Sisi Mahasiswa (Pembeli & Penjual)
* **Katalog Berbasis Jaringan Lokasi (31 Kecamatan Surabaya):** Filter barang berdasarkan lokasi kecamatan di Surabaya (Sukolilo, Gubeng, Mulyorejo, Rungkut, Wonokromo, dll).
* **Detail Barang & Perhitungan Transparan:** Perhitungan harga final (termasuk markup platform) dan simulasi ongkos kirim real-time.
* **Checkout Manual via WhatsApp API:** Template pesan WA otomatis berisi rincian pesanan dan instruksi pembayaran QRIS.
* **Dashboard Seller (Penjual):**
  - Pasang iklan barang bekas baru dengan foto, kategori, berat, dan deskripsi.
  - Pantau status penjualan & riwayat pesanan.
  - Kelola data rekening bank pencairan dana.

### 🛡️ 2. Control Panel SIM Admin Operasional (`/admin`)
* **Executive Summary Dashboard:**
  - Grafik tren keuntungan bulanan (*Platform Profit*, *Markup Profit*, *Ongkir Profit*).
  - Ringkasan statistik realtime (Total GMV, Total User, Total Produk, Pending Orders).
  - Widget waktu realtime (Live Clock) & pengubah mode tema (Mode Siang / Mode Malam dengan ikon SVG).
* **Kelola Order & Resi WA Management:**
  - Pemantauan dan pengelolaan penuh status transaksi: `Menunggu Pembayaran`, `Dibayar`, `Dijemput`, `Dalam Pengiriman`, `Selesai`, `Dibatalkan`.
  - Tombol aksi cepat untuk memperbarui status pesanan.
* **Kelola Katalog Produk:**
  - Kontrol listing produk aktif/nonaktif dari seluruh seller.
  - Filter interaktif berbasis kartu status, pencarian kata kunci, bulan, dan kategori.
* **Manajemen User & Hak Akses (RBAC):**
  - Kontrol otorisasi peran pengguna (`buyer`, `seller`, `admin`).
  - Fitur CRUD lengkap akun pengguna & verifikasi status penjual.
  - Pemetaan lokasi pengguna berbasis 31 Kecamatan Surabaya.
* **Pencairan Saldo (Payouts):**
  - Antrian transfer dana ke rekening penjual sebesar harga input asli.
  - Verifikasi satu klik dengan bukti transfer pencairan.
* **Audit Trail System (Log Aktivitas):**
  - Catatan log permanen aktivitas admin untuk transparansi dan akuntabilitas sistem.

---

## 🛠️ Tech Stack & Arsitektur

| Layer | Teknologi |
|---|---|
| **Framework Frontend** | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| **UI & Styling** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons & Visual** | Clean Inline SVG (Sun/Moon Theme Icons, Action Icons) |
| **Database & Backend Services** | [Supabase](https://supabase.com/) (PostgreSQL Database, Storage & Auth) |
| **Client Auth & SSR** | `@supabase/supabase-js`, `@supabase/ssr` |
| **Helper Tools & Formatter** | Custom Pricing Calculation (`lib/pricing.ts`), Districts Surabaya Mapping (`lib/districts.ts`) |

---

## 📁 Struktur Proyek

```text
baranginaja/
├── app/                    # Next.js App Router (Pages & API Routes)
│   ├── admin/              # SIM Admin Dashboard, Products, Order, Users (RBAC), Payouts, & Logs
│   ├── jual/               # Halaman Penjual / Tambah Produk Jual
│   ├── login/              # Halaman Autentikasi Login
│   ├── order/              # Halaman Pesanan Saya & Rincian Transaksi
│   ├── produk/             # Katalog & Detail Produk Client
│   ├── profil/             # Profil User & Pengaturan Rekening Bank
│   ├── register/           # Pendaftaran Akun Baru
│   ├── layout.tsx          # Root Layout Aplikasi
│   └── page.tsx            # Landing Page Utama
├── components/             # Komponen UI Reusable
│   ├── theme-toggle.tsx    # Dropdown Mode Siang / Malam dengan Ikon SVG
│   ├── navbar.tsx          # Navbar Utama Client
│   ├── footer.tsx          # Footer Platform
│   └── toast.tsx           # Notifikasi Toast System
├── lib/                    # Utilities, Types, & Supabase Clients
│   ├── districts.ts        # Data & Helper 31 Kecamatan Surabaya
│   ├── pricing.ts          # Formula Kalkulasi Markup & Ongkir
│   ├── supabase/           # Client, Server, Storage, & Guards Helper
│   └── types/              # Type Definitions TypeScript (Database Schemas)
├── public/                 # Asset Gambar, Logo, & Icon
├── README.md               # Dokumentasi Proyek
└── package.json            # Dependensi Proyek
```

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Prasyarat
Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/) v18.0.0 atau lebih baru
- `npm` atau `pnpm`

### 2. Kloning Repository & Instalasi Dependensi
```bash
git clone https://github.com/alvin23-mj/baranginaja.git
cd baranginaja
npm install
```

### 3. Konfigurasi Environment Variable (`.env.local`)
Buat file `.env.local` di root direktori project:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser dan akses **`http://localhost:3000`**.

---

## 🔐 Akun Pengujian Demo (Default Credentials)

Untuk menguji fitur-fitur platform, gunakan akun demo yang terdaftar di Supabase Database:

| Peran (Role) | Email | Password | Akses URL |
|---|---|---|---|
| **Admin Operasional** | `admin@barangin.com` | `admin123` | `http://localhost:3000/admin` |
| **Penjual (Seller)** | `seller@barangin.com` | `seller123` | `http://localhost:3000/jual` |
| **Pembeli (Buyer)** | `buyer@barangin.com` | `buyer123` | `http://localhost:3000/produk` |

---

## 🤝 Lisensi & Hak Cipta

Dikembangkan oleh **Tim BaranginAja** © 2026. Hak cipta dilindungi undang-undang.  
Bebas digunakan untuk keperluan pembelajaran dan pengembangan internal kampus.
