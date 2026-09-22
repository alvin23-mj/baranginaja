# 📚 Dokumentasi Lengkap Alur Bisnis, Alur Teknik, dan Deskripsi File Project BaranginAja

Dokumen ini berisi gambaran menyeluruh dan mendetail mengenai **Alur Bisnis**, **Alur Teknik**, serta **Fungsi dan Isi Codingan Setiap File** pada project **BaranginAja** — Platform E-Commerce & SIM (Sistem Informasi Manajemen) Hyper-Local Jual Beli Barang Bekas Antar Mahasiswa & Warga Kos se-Surabaya.

---

## 📑 DAFTAR ISI
1. [🏢 ALUR BISNIS (BUSINESS FLOW)](#1-alur-bisnis-business-flow)
   - 1.1 Overview & Positioning Platform
   - 1.2 Model Monetisasi & Tiering Markup Harga Jual
   - 1.3 Skema Ongkos Kirim (COD vs Kurir Platform)
   - 1.4 Sistem Hak Akses & Dual-Role (Buyer, Seller, Admin)
   - 1.5 State Machine Status Produk
   - 1.6 State Machine Status Order & Logistik Pengiriman
   - 1.7 Sistem Proteksi Hold Stok 45 Menit (Lazy Expiration)
   - 1.8 Alur Pembayaran (QRIS + WhatsApp API Integration)
   - 1.9 Alur Pencairan Saldo Penjual (Payouts) & Margin Keuntungan Platform
   - 1.10 Audit Trail & Logging SIM Admin Operasional
2. [⚙️ ALUR TEKNIK & ARSITEKTUR SISTEM (TECHNICAL FLOW)](#2-alur-teknik--arsitektur-sistem-technical-flow)
   - 2.1 Arsitektur Stack (Next.js 16 App Router, React 19, Supabase, Tailwind CSS v4)
   - 2.2 Autentikasi, Session Management & Middleware (`@supabase/ssr` & `proxy.ts`)
   - 2.3 Otorisasi RBAC & Security Guards (`requireAdmin`, `requireSeller`)
   - 2.4 Strategi Data Flow (SSR/Server Components vs Client Components)
   - 2.5 Geolocation & Distance Calculation (Kalkulasi Jarak Haversine & Leaflet Map)
   - 2.6 Storage Bucket System (Media & Document Management)
   - 2.7 Theme Persistence (Zero-Flash Dark Mode Switcher)
3. [📂 DEKLARE DAN PENJELASAN MENDETAIL SETIAP FILE & CODINGANNYA](#3-deklare-dan-penjelasan-mendetail-setiap-file--codingannya)
   - 3.1 Configuration & Root Files
   - 3.2 Core Utilities & Business Logic (`lib/`)
   - 3.3 Supabase Infrastructure & Database Types (`lib/supabase/` & `lib/types/`)
   - 3.4 Reusable UI Components (`components/`)
   - 3.5 App Router Pages & Layouts (`app/`)

---

## 1. 🏢 ALUR BISNIS (BUSINESS FLOW)

### 1.1 Overview & Positioning Platform
**BaranginAja** diciptakan khusus untuk mengatasi permasalahan tingginya sirkulasi barang bekas (perabotan kos, elektronik, buku kuliah, perlengkapan rumah tangga) milik mahasiswa yang berpindah kos atau lulus kuliah di area Kota Surabaya. Platform ini berfokus pada **31 Kecamatan di Kota Surabaya** untuk memastikan efisiensi ongkos kirim dan kedekatan lokasi antar pembeli dan penjual.

### 1.2 Model Monetisasi & Tiering Markup Harga Jual
Platform menerapkan komisi/margin keuntungan (*markup*) otomatis yang ditambahkan di atas harga input penjual (`harga_input`). Penjual tidak dipotong biaya apapun dari harga input yang disepakati, melainkan pembeli membayar harga jual yang telah ditingkatkan (`harga_jual`).

**Skema Tiering Markup:**
* **Tier 1 (`harga_input` < Rp 100.000):** Markup **12%**
* **Tier 2 (Rp 100.000 ≤ `harga_input` < Rp 500.000):** Markup **10%**
* **Tier 3 (`harga_input` ≥ Rp 500.000):** Markup **8%**

**Rumus Matematika Markup:**
$$\text{harga\_jual\_tampil} = \text{harga\_input} + \text{Math.round}(\text{harga\_input} \times \text{markup\_rate})$$
$$\text{fee\_platform} = \text{harga\_jual\_tampil} - \text{harga\_input}$$

### 1.3 Skema Ongkos Kirim (COD vs Kurir Platform)
Pembeli dapat memilih 2 metode pengiriman:
1. **COD / Ambil Sendiri:** Gratis Ongkir (`ongkir = 0`). Pembeli bertemu langsung dengan penjual di lokasi yang disepakati.
2. **Kurir Platform:** Biaya pengiriman dihitung secara otomatis berdasarkan jarak garis lurus (*Haversine Formula*) antara koordinat kos penjual ($\text{lat}_1, \text{lng}_1$) dan pembeli ($\text{lat}_2, \text{lng}_2$), serta berat barang (`berat_kg`).

**Rumus Ongkir:**
$$\text{ongkir\_raw} = (\text{jarak\_km} \times 2.500) + (\text{berat\_kg} \times 5.000)$$
$$\text{ongkir\_final} = \lceil \text{ongkir\_raw} / 5000 \rceil \times 5000 \quad \text{(Dibulatkan ke atas ke kelipatan 5.000)}$$

### 1.4 Sistem Hak Akses & Dual-Role (Buyer, Seller, Admin)
Setiap pengguna terdaftar dalam tabel `users` dengan atribut `role` (`buyer`, `seller`, `admin`) dan flag `is_seller`:
* **Buyer (Pembeli Default):** Semua pengguna terdaftar dapat mencari barang, menambah ke keranjang/checkout, dan mengelola profil.
* **Seller (Penjual):** Pengguna yang melengkapi alamat kos dan koordinat peta dapat mengaktifkan status penjual (`is_seller = true`) untuk memasang iklan barang bekas.
* **Admin (SIM Operasional):** Memiliki hak akses khusus ke dashboard `/admin` untuk memverifikasi pembayaran, memperbarui status pengiriman, mencairkan saldo payout penjual, dan memantau keuntungan platform.

### 1.5 State Machine Status Produk
Status produk (`products.status`) mengikuti transisi berikut:
```
[Tersedia] ---> (Buyer melakukan Checkout) ---> [Dipesan]
    ^                                               |
    |------- (Hold Timer 45 Menit Habis) -----------|
                                                    |
                                            (Pembayaran Dikonfirmasi Admin)
                                                    v
                                                [Terjual]
```

### 1.6 State Machine Status Order & Logistik Pengiriman
Status pesanan (`orders.status`) memiliki alur transisi bertahap:
1. `Menunggu Pembayaran`: Dipicu saat checkout dibuat.
2. `Dibayar`: Ditetapkan oleh Admin setelah verifikasi bukti bayar QRIS.
3. `Dijemput`: Kurir platform menjemput barang di kos penjual.
4. `Dalam Pengiriman`: Barang sedang diantar oleh kurir menuju lokasi pembeli.
5. `Diterima`: Pembeli atau Kurir mengonfirmasi barang telah sampai.
6. `Selesai`: Pesanan ditandai selesai, sistem otomatis membuat antrian **Payout** untuk penjual.
7. `Dibatalkan`: Dipicu jika hold timer habis atau pesanan ditolak/dibatalkan oleh admin/user.

### 1.7 Sistem Proteksi Hold Stok 45 Menit (Lazy Expiration)
Untuk mencegah *double order* tanpa memerlukan *cron job* server yang berat, sistem menggunakan pendekatan **Lazy Expiration** via fungsi `expireHoldIfNeeded`:
* Saat pembeli menekan "Buat Pesanan", `hold_expires_at` diisi waktu `NOW + 45 menit` dan produk berubah ke `Dipesan`.
* Setiap kali halaman detail order (`/order/[id]`) atau daftar pesanan dibuka, sistem memeriksa apakah `status === "Menunggu Pembayaran"` dan `hold_expires_at < NOW()`. Jika waktu habis, status order otomatis diubah ke `Dibatalkan` dan stok produk dikembalikan ke `Tersedia`.

### 1.8 Alur Pembayaran (QRIS + WhatsApp API Integration)
1. Pembeli membuat pesanan di web.
2. Pembeli diarahkan ke halaman detail order yang menampilkan instruksi transfer QRIS dan tombol **"Konfirmasi via WhatsApp"**.
3. Tombol WhatsApp menggenerate pesan terformat menuju nomor WhatsApp penjual/admin dengan rincian produk, ID order, total harga, dan opsi pengiriman.
4. Pembeli mengunggah foto bukti bayar ke sistem.

### 1.9 Alur Pencairan Saldo Penjual (Payouts) & Margin Keuntungan Platform
* Ketika order mencapai status `Selesai`, sistem membuat record pada tabel `payouts` dengan nominal sama persis dengan `harga_input` asli milik penjual.
* Selisih markup harga (`harga_jual - harga_input`) dan ongkos kirim menjadi **Revenue Platform (Platform Profit)**.
* Admin memproses pencairan saldo via menu `/admin/payout` dengan melakukan transfer bank ke rekening penjual dan memperbarui status payout menjadi `dicairkan`.

### 1.10 Audit Trail & Logging SIM Admin Operasional
Setiap tindakan kritis yang dilakukan Admin (seperti mengubah status order, memverifikasi pembayaran, atau mengedit pengguna) dicatat secara permanen pada tabel `activity_logs` dengan menyimpan `admin_id`, `order_id`, `aksi`, dan `timestamp`.

---

## 2. ⚙️ ALUR TEKNIK & ARSITEKTUR SISTEM (TECHNICAL FLOW)

### 2.1 Arsitektur Stack
* **Framework:** Next.js 16 (App Router) menggunakan Turbopack untuk kompilasi ultra cepat.
* **React Engine:** React 19 (Server Components + Client Components).
* **Styling Engine:** Tailwind CSS v4 dengan dukungan native Dark Mode via CSS variables dan class switcher.
* **Backend as a Service (BaaS):** Supabase (PostgreSQL Database, GoTrue Auth Engine, & Storage Buckets).
* **Libraries tambahan:** Leaflet (`leaflet`, `@types/leaflet`) untuk peta interaktif.

### 2.2 Autentikasi, Session Management & Middleware (`@supabase/ssr` & `proxy.ts`)
* Autentikasi dikelola menggunakan `@supabase/ssr` yang menyimpan JWT token dalam *HTTP-only cookies*.
* File `proxy.ts` (Next.js Middleware) memfilter setiap request halaman. Jika pengguna mencoba mengakses route privat (seperti `/checkout`, `/order`, `/jual`, `/profil`, `/admin`) tanpa session aktif, middleware akan meredirect pengguna ke `/login?redirectTo=...`.

### 2.3 Otorisasi RBAC & Security Guards (`requireAdmin`, `requireSeller`)
Di tingkat Server Component, otorisasi dipastikan dengan helper guard di `lib/supabase/guards.ts`:
* `requireSeller(supabase, currentPath)`: Memastikan user terautentikasi dan memiliki `is_seller === true`. Jika belum, diredirect ke `/profil`.
* `requireAdmin(supabase, currentPath)`: Memastikan user terautentikasi dan memiliki `role === "admin"`. Jika bukan admin, diredirect ke `/` dengan query `?akses_ditolak=1`.

### 2.4 Strategi Data Flow (SSR vs Client Components)
* **Server Components (Default Pages):** Mengambil data dari Supabase via `lib/supabase/server.ts` langsung di server Node.js/Edge, sehingga SEO maksimal dan tidak ada layout shift.
* **Client Components (`"use client"`):** Digunakan untuk form interaktif, state management lokal, animasi UI, modal peta, dan subscription real-time.

### 2.5 Geolocation & Distance Calculation
* Komponen `MapPickerModal` memanfaatkan **Leaflet** untuk menampilkan peta interaktif 31 Kecamatan Surabaya. User dapat menggeser pin marker untuk mengambil koordinat Latitude & Longitude.
* Fungsi `haversineDistanceKm` di `lib/geo.ts` menghitung jarak spasial antar 2 pasang koordinat bumi menggunakan rumus trigonometri Haversine:
  $$a = \sin^2(\Delta \text{lat}/2) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \sin^2(\Delta \text{lng}/2)$$
  $$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})$$
  $$d = R \cdot c \quad (R = 6371 \text{ km})$$

### 2.6 Storage Bucket System
Supabase Storage dibagi menjadi 2 bucket utama:
1. `product-photos`: Menyimpan foto produk penjual (maksimal 5 foto per produk, format JPEG/PNG/WebP, maksimal 5MB per file).
2. `bukti-pembayaran`: Menyimpan bukti transfer pembayaran QRIS yang diunggah pembeli.

### 2.7 Theme Persistence (Admin-Only Dark Mode Switcher)
Fitur mode malam (Dark Mode) dan mode siang (Light Mode) secara khusus dibatasi **hanya bekerja pada area Dashboard Admin (`/admin`)**:
* File `app/layout.tsx` menyisipkan script inline `<script dangerouslySetInnerHTML=... />` di `<head>` dan komponen `AdminThemeGuard` (`components/admin-theme-guard.tsx`) yang memastikan kelas `.dark` hanya aktif jika URL diawali dengan `/admin`. Seluruh halaman publik/client selalu dirender dalam Mode Siang (Light Mode).
* Komponen `ThemeToggle` di `components/theme-toggle.tsx` menyediakan dropdown UI interaktif dengan ikon SVG Sun/Moon untuk mengganti mode siang/malam di area SIM Admin.

---

## 3. 📂 DEKLARE DAN PENJELASAN MENDETAIL SETIAP FILE & CODINGANNYA

Berikut adalah penjelasan mendetail fungsi, isi, dan peranan dari **seluruh file** yang ada di dalam repository project `baranginaja`:

### 3.1 Configuration & Root Files

#### 1. `package.json`
* **Fungsi:** Manifest konfigurasi dependensi npm dan script project.
* **Isi Codingan:** Mendefinisikan dependensi utama seperti `next: 16.3.5`, `react: 19.2.8`, `@supabase/ssr`, `@supabase/supabase-js`, `leaflet`, `tailwindcss: ^4`, dan script perintah (`dev`, `build`, `start`, `lint`).

#### 2. `tsconfig.json`
* **Fungsi:** Konfigurasi compiler TypeScript.
* **Isi Codingan:** Mengatur alias path `@/*` yang merujuk ke root folder project, strict mode, JSX preserve/react-jsx, serta modul resolution Next.js.

#### 3. `next.config.ts`
* **Fungsi:** Konfigurasi framework Next.js.
* **Isi Codingan:** Menampung opsi kustomisasi Next.js seperti optimasi domain gambar luar (remote patterns) Supabase Storage.

#### 4. `postcss.config.mjs`
* **Fungsi:** Konfigurasi prapemroses PostCSS.
* **Isi Codingan:** Memuat plugin `@tailwindcss/postcss` untuk mengkompilasi CSS Tailwind v4.

#### 5. `eslint.config.mjs`
* **Fungsi:** Konfigurasi linter ESLint.
* **Isi Codingan:** Mengintegrasikan aturan linting bawaan Next.js (`eslint-config-next`).

#### 6. `proxy.ts` (Root Middleware Proxy)
* **Fungsi:** Middleware Next.js di root project yang mencegat seluruh request HTTP masuk.
* **Isi Codingan:** Mengimpor `updateSession` dari `@/lib/supabase/proxy` dan mengeksekusinya pada matcher route aplikasi (membatasi route privat dan memperbarui token cookies session).

#### 7. `.env.local`
* **Fungsi:** File variabel lingkungan lokal (environment variables).
* **Isi Codingan:** Menyimpan URL proyek Supabase (`NEXT_PUBLIC_SUPABASE_URL`), Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`), dan Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`).

#### 8. `CLAUDE.md` & `README.md`
* **Fungsi:** Dokumentasi teknis dan konteks panduan pengembangan project.
* **Isi Codingan:** `CLAUDE.md` memuat spesifikasi skema data Supabase, bisnis rules markup, dan state machine. `README.md` memuat panduan instalasi, credential akun demo, dan deskripsi fitur.

#### 9. `AGENTS.md`
* **Fungsi:** Aturan instruksi agen pengembang AI Next.js.

---

### 3.2 Core Utilities & Business Logic (`lib/`)

#### 10. `lib/pricing.ts`
* **Fungsi:** Modul kalkulasi harga, markup komisi platform, format uang Rupiah, dan ongkos kirim.
* **Isi Codingan:**
  - `getMarkupRate(hargaInput)`: Mengembalikan rate komisi (0.12, 0.10, atau 0.08) berdasarkan harga input.
  - `calculateHargaJual(hargaInput)`: Mengembalikan objek `HargaBreakdown` (`hargaInput`, `markupRate`, `markupAmount`, `hargaJual`).
  - `formatRupiah(value)`: Mengubah angka menjadi format string mata uang Rupiah Indonesia (misal: `Rp 50.000`).
  - `calculateOngkir(jarakKm, beratKg)`: Menghitung ongkir mentah dan membulatkannya ke kelipatan 5.000 terdekat.

#### 11. `lib/districts.ts`
* **Fungsi:** Pengelola data master 31 Kecamatan Kota Surabaya dan helper pencarian nama kecamatan.
* **Isi Codingan:**
  - `KECAMATAN_SURABAYA`: Array konstanta 31 kecamatan di Surabaya (Asemrowo, Benowo, Bubutan, ..., Wonokromo).
  - `getDistricts(supabase)`: Mengambil daftar kecamatan aktif dari tabel database `districts`, atau fallback ke konstanta jika offline/error.
  - `findDistrictName(districtId)`: Mencari nama kecamatan berdasarkan ID.

#### 12. `lib/geo.ts`
* **Fungsi:** Modul kalkulasi matematika spasial/geografis.
* **Isi Codingan:** `haversineDistanceKm(lat1, lng1, lat2, lng2)` menghitung jarak lurus dalam satuan kilometer di permukaan bumi menggunakan rumus Haversine.

#### 13. `lib/orders.ts`
* **Fungsi:** Modul manajemen status order, label badge CSS status, dan proteksi hold timer stok 45 menit.
* **Isi Codingan:**
  - `HOLD_DURATION_MINUTES = 45`: Durasi masa kunci stok produk.
  - `ORDER_STATUS_LABEL` & `ORDER_STATUS_CLASS`: Map warna badge CSS untuk tiap status pesanan.
  - `expireHoldIfNeeded(supabase, order)`: Mengubah status order ke `Dibatalkan` dan stok produk kembali ke `Tersedia` secara *lazy* jika waktu hold habis.
  - `computeHoldExpiresAt()`: Menghasilkan ISO timestamp untuk 45 menit ke depan.
  - `formatCountdown(msRemaining)`: Mengubah milidetik tersisa menjadi string timer `MM:SS`.
  - `nextShippingStatus(status)`: Menentukan alur transisi status logistik berikutnya.

#### 14. `lib/payouts.ts`
* **Fungsi:** Logika pembuatan antrian pencairan dana penjual.
* **Isi Codingan:**
  - `createPayoutIfNeeded(supabase, { orderId, sellerId, nominal })`: Memeriksa apakah payout untuk order terkait sudah ada. Jika belum, meng-insert record baru ke tabel `payouts` dengan status `menunggu`.

#### 15. `lib/whatsapp.ts`
* **Fungsi:** Helper untuk format nomor telepon Indonesia dan pembuat URL WhatsApp API (`wa.me`).
* **Isi Codingan:**
  - `normalizeIndonesianPhoneForWhatsApp(rawPhone)`: Mengubah format nomor `08xx` atau `+628xx` menjadi `628xx`.
  - `buildOrderWhatsAppLink(...)`: Mengkomposisi string pesan WhatsApp rincian transaksi dan meng-encode-nya ke URL `https://wa.me/628xx?text=...`.

#### 16. `lib/validation.ts`
* **Fungsi:** Helper validasi input data pengetikan.
* **Isi Codingan:** `isValidIndonesianPhone(value)` (regex nomor telepon seluler Indonesia) dan `isDigitsOnly(value)` (regex angka saja).

#### 17. `lib/constants.ts`
* **Fungsi:** Penyimpan data konstanta aplikasi.
* **Isi Codingan:** `BANK_OPTIONS` (Array pilihan bank lokal Indonesia: BCA, BRI, BNI, Mandiri, BSI, CIMB Niaga, Danamon, Permata, Jago, SeaBank, Jenius, OCBC NISP, Lainnya).

---

### 3.3 Supabase Infrastructure & Database Types (`lib/supabase/` & `lib/types/`)

#### 18. `lib/types/database.ts`
* **Fungsi:** Definisi tipe TypeScript untuk skema tabel database PostgreSQL Supabase.
* **Isi Codingan:** Mengatur interface `UserRow`, `District`, `Campus`, `ProductRow`, `OrderRow`, `PayoutRow`, `ActivityLogRow`, `UserWithDistrict`, `ProductWithSeller`, `OrderWithProduct`, `AdminOrderDetail`, serta enum type (`OrderStatus`, `ProductStatus`, `ShippingOption`, `PayoutStatus`).

#### 19. `lib/supabase/client.ts`
* **Fungsi:** Pabrik pembuatan client Supabase untuk Client Components (`"use client"`).
* **Isi Codingan:** Mengeksekusi `createBrowserClient` dari `@supabase/ssr` menggunakan env public.

#### 20. `lib/supabase/server.ts`
* **Fungsi:** Pabrik pembuatan client Supabase untuk Server Components dan Server Actions.
* **Isi Codingan:** Mengeksekusi `createServerClient` dari `@supabase/ssr` dengan pembacaan dan penulisan cookies Next.js `cookies()`.

#### 21. `lib/supabase/guards.ts`
* **Fungsi:** Guard pengaman hak akses role pengguna di Server Components.
* **Isi Codingan:**
  - `requireSeller(supabase, currentPath)`: Memastikan user terautentikasi dan bertindak sebagai penjual (`is_seller = true`).
  - `requireAdmin(supabase, currentPath)`: Memastikan user terautentikasi dan memiliki role `admin`.

#### 22. `lib/supabase/proxy.ts`
* **Fungsi:** Logika pembuka dan pembaru session cookies untuk Middleware.
* **Isi Codingan:** Menginisialisasi `createServerClient` di middleware, memanggil `getUser()`, memeriksa daftar `PUBLIC_ROUTES`, dan meredirect ke `/login` jika user mencoba membobol halaman privat.

#### 23. `lib/supabase/storage.ts`
* **Fungsi:** Utilitas pengelolaan berkas Supabase Storage.
* **Isi Codingan:** Menentukan nama bucket (`product-photos`, `bukti-pembayaran`), batas ukuran file (5MB), ekstensi file yang diizinkan (JPEG, PNG, WebP), dan fungsi validasi `isValidPhotoFile`.

---

### 3.4 Reusable UI Components (`components/`)

#### 24. `components/navbar.tsx`
* **Fungsi:** Server Component pembungkus Navbar utama aplikasi.
* **Isi Codingan:** Mengambil data user yang sedang login, status admin/seller, nama kecamatan user, daftar kategori, dan kecamatan dari Supabase Server Client, lalu meneruskannya ke `NavbarClient`.

#### 25. `components/navbar-client.tsx`
* **Fungsi:** Client Component untuk navigasi atas aplikasi.
* **Isi Codingan:** Menampilkan logo BaranginAja, pencarian produk, menu kategori dropdown, indicator lokasi kecamatan, tombol pasang iklan, tombol profil/dashboard admin, serta trigger penampil drawer auth register/login.

#### 26. `components/footer.tsx`
* **Fungsi:** Komponen bagian bawah (footer) aplikasi.
* **Isi Codingan:** Menampilkan informasi platform, link navigasi cepat (Panduan, FAQ, Bantuan, Tentang Kami, Ulasan), hak cipta, dan kredensial developer.

#### 27. `components/theme-toggle.tsx`
* **Fungsi:** Komponen dropdown pemilih mode tema (Mode Siang / Mode Malam).
* **Isi Codingan:** Mengelola state tema di `localStorage` dan class `.dark` pada tag `<html>`, serta menampilkan ikon SVG Matahari (Sun) dan Bulan (Moon).

#### 28. `components/product-card.tsx`
* **Fungsi:** Card tampilan item produk pada katalog.
* **Isi Codingan:** Menampilkan foto utama produk, nama barang, harga jual ter-markup (format Rupiah), serta badge lokasi kecamatan penjual.

#### 29. `components/product-card-skeleton.tsx`
* **Fungsi:** Placeholder animasi loading (skeleton) saat data produk sedang dimuat.
* **Isi Codingan:** Render elemen pulsa (`animate-pulse`) berbentuk persegi foto dan baris teks.

#### 30. `components/auth-drawer.tsx`
* **Fungsi:** Drawer slide-over samping untuk proses registrasi cepat dan login modal.
* **Isi Codingan:** Menampilkan form pendaftaran mahasiswa kos (pilihan 31 kecamatan Surabaya, nama lengkap, email, password, nomor WA) dengan animasi smooth.

#### 31. `components/map-picker-modal.tsx`
* **Fungsi:** Modal dialog penentu lokasi alamat kos berbasis peta interaktif Leaflet.
* **Isi Codingan:** Memuat Leaflet Map secara dinamis (CSR), menangani drag marker pin untuk memperbarui nilai Latitude & Longitude penjual/pembeli.

#### 32. `components/contact-section.tsx`
* **Fungsi:** Komponen seksi kontak dan bantuan pelanggan pada landing page.
* **Isi Codingan:** Menampilkan kartu kontak support WhatsApp, email CS, dan lokasi operasional kantor Surabaya.

#### 33. `components/category-showcase.tsx`
* **Fungsi:** Komponen grid showcase pilihan kategori populer (Elektronik, Perabotan Kos, Buku, dll).

#### 34. `components/advantages-slider.tsx`
* **Fungsi:** Komponen slider keunggulan platform BaranginAja (Markup transparan, Kurir lokal, Garansi hold stok).

#### 35. `components/hero-stats-ticker.tsx`
* **Fungsi:** Ticker statistik realtime angka transaksi, jumlah pengguna, dan kecamatan yang tercover.

#### 36. `components/how-it-works-section.tsx`
* **Fungsi:** Panduan visual 3 langkah mudah cara bertransaksi di BaranginAja.

#### 37. `components/logout-button.tsx`
* **Fungsi:** Tombol logout akun pengguna.
* **Isi Codingan:** Memanggil `supabase.auth.signOut()` dan mengarahkan kembali ke halaman utama (`/`).

#### 38. `components/toast.tsx` & `components/access-denied-toast.tsx`
* **Fungsi:** Komponen pop-up notifikasi melayang (Toast) untuk pesan sukses, error, atau penolakan akses admin.

---

### 3.5 App Router Pages & Layouts (`app/`)

#### Root & Global Pages

##### 39. `app/layout.tsx`
* **Fungsi:** Root Layout seluruh halaman web.
* **Isi Codingan:** Menyisipkan font Google "Pathway Extreme", script pencegah flash dark mode, wrapper `<Navbar />` dan `<Footer />`, serta metadata SEO global.

##### 40. `app/globals.css`
* **Fungsi:** Stylesheet CSS global aplikasi.
* **Isi Codingan:** Mengimpor `@import "tailwindcss";`, variabel CSS tema gelap/terang, serta utilitas kustomisasi scrollbar dan animasi page transition.

##### 41. `app/page.tsx`
* **Fungsi:** Landing Page (Halaman Utama) BaranginAja (`/`).
* **Isi Codingan:** Menampilkan Banner Hero, statistik singkat, showcase kategori, slider keunggulan, daftar 8 produk terbaru dari Supabase, dan seksi kontak support.

---

#### Auth Routes (`app/login`, `app/register`, `app/auth`)

##### 42. `app/login/page.tsx`
* **Fungsi:** Halaman pembungkus Login (`/login`).
* **Isi Codingan:** Mengambil query `redirectTo` dan merender `AuthCard` & `LoginForm`.

##### 43. `app/login/login-form.tsx`
* **Fungsi:** Form interaktif input email & password untuk login.
* **Isi Codingan:** Memanggil `supabase.auth.signInWithPassword()`, menangani error pesan kredensial salah, dan meredirect user ke halaman tujuan.

##### 44. `app/login/auth-card.tsx`
* **Fungsi:** UI Card container bertema modern untuk form autentikasi.

##### 45. `app/register/page.tsx` & `app/register/register-form.tsx`
* **Fungsi:** Halaman pendaftaran akun baru (`/register`).
* **Isi Codingan:** Mengumpulkan data pendaftaran (nama lengkap, email, password, nomor WA, kecamatan Surabaya), membuat akun Auth Supabase, dan menyimpan data profile awal ke tabel `users`.

##### 46. `app/auth/callback/route.ts`
* **Fungsi:** API Route handler untuk callback verifikasi email / OAuth Supabase.
* **Isi Codingan:** Mempertukarkan `code` dari URL query menjadi session token aktif Supabase.

---

#### Product Catalog Routes (`app/produk`)

##### 47. `app/produk/page.tsx`
* **Fungsi:** Halaman Katalog Pencarian Produk (`/produk`).
* **Isi Codingan:** Server Component yang mengambil data produk berstatus `Tersedia` dari Supabase dengan filter pencarian kata kunci, kategori, pilihan kecamatan, dan sorting harga/terbaru.

##### 48. `app/produk/product-filters.tsx`
* **Fungsi:** Baris filter interaktif di atas katalog produk.
* **Isi Codingan:** Input pencarian teks, dropdown kategori, dropdown 31 kecamatan, dan dropdown pengurutan harga.

##### 49. `app/produk/loading.tsx`
* **Fungsi:** UI Loading skeleton saat katalog produk sedang dimuat.

##### 50. `app/produk/[id]/page.tsx`
* **Fungsi:** Halaman Rincian Detail Produk (`/produk/[id]`).
* **Isi Codingan:** Menampilkan galeri foto produk, harga jual (termasuk breakdown markup transparan), deskripsi barang, kondisi, berat, profil lokasi penjual, serta tombol **"Beli Sekarang / Checkout"**.

##### 51. `app/produk/[id]/product-gallery.tsx`
* **Fungsi:** Component galeri gambar produk interaktif.
* **Isi Codingan:** Menampilkan foto utama berukuran besar dan gambar thumbnail yang dapat diklik untuk berganti foto.

##### 52. `app/produk/[id]/loading.tsx` & `app/produk/[id]/not-found.tsx`
* **Fungsi:** State loading & tampilan 404 jika ID produk tidak ditemukan di database.

---

#### Checkout & Order Routes (`app/checkout`, `app/order`, `app/pesanan-saya`)

##### 53. `app/checkout/[id]/page.tsx`
* **Fungsi:** Halaman Pembuka Checkout Pesanan (`/checkout/[id]`).
* **Isi Codingan:** Server Component yang memvalidasi ketersediaan produk dan mengambil data domisili pembeli (lat/lng/alamat) dari tabel `users`.

##### 54. `app/checkout/[id]/checkout-form.tsx`
* **Fungsi:** Form interaktif transaksi checkout.
* **Isi Codingan:**
  - Menghitung jarak pengiriman otomatis via `haversineDistanceKm` jika memilih Kurir Platform.
  - Menghitung ongkir via `calculateOngkir`.
  - Mengubah status produk menjadi `Dipesan` secara atomik di database.
  - Membuat record transaksi baru pada tabel `orders` dengan `status = "Menunggu Pembayaran"` dan `hold_expires_at = NOW + 45 menit`.
  - Meredirect ke halaman `/order/[order_id]`.

##### 55. `app/order/[id]/page.tsx`
* **Fungsi:** Halaman Rincian Pesanan & Instruksi Pembayaran (`/order/[id]`).
* **Isi Codingan:**
  - Menjalankan `expireHoldIfNeeded` untuk mengecek keabsahan hold timer.
  - Menampilkan ringkasan produk, status order badge, instruksi pembayaran QRIS, upload bukti bayar, dan tombol **"Konfirmasi via WhatsApp"**.

##### 56. `app/order/[id]/order-countdown.tsx`
* **Fungsi:** Ticker hitung mundur (countdown timer) sisa waktu hold 45 menit.
* **Isi Codingan:** Menggunakan `setInterval` setiap detik untuk memperbarui tampilan waktu `MM:SS` secara realtime di browser pembeli.

##### 57. `app/pesanan-saya/page.tsx`
* **Fungsi:** Halaman Riwayat Pesanan Saya (`/pesanan-saya`).
* **Isi Codingan:** Menampilkan daftar seluruh transaksi yang pernah dilakukan oleh user login sebagai pembeli beserta status terbarunya.

---

#### Seller Portal Routes (`app/jual`)

##### 58. `app/jual/page.tsx`
* **Fungsi:** Halaman Dashboard Penjual (`/jual`).
* **Isi Codingan:** Menggunakan guard `requireSeller`. Menampilkan daftar produk yang sedang dijual oleh penjual, statistik barang terpasang, dan tombol tambah produk baru.

##### 59. `app/jual/product-list.tsx`
* **Fungsi:** Komponen tabel/grid daftar barang milik penjual.
* **Isi Codingan:** Menampilkan status barang (`Tersedia`, `Dipesan`, `Terjual`), tombol edit, dan tombol hapus produk.

##### 60. `app/jual/product-form.tsx`
* **Fungsi:** Form tambah / edit iklan barang bekas.
* **Isi Codingan:** Input nama barang, deskripsi, kategori, kondisi barang, `harga_input` penjual, berat barang (kg), upload hingga 5 foto ke Supabase Storage, dan penentuan posisi lokasi kos di peta (`MapPickerModal`). Menghitung secara otomatis simulasi harga jual yang akan tampil di katalog.

##### 61. `app/jual/photo-picker.tsx`
* **Fungsi:** Component pengunggah dan pratinjau (preview) foto produk.
* **Isi Codingan:** Memvalidasi tipe/ukuran file foto dan mengunggahnya ke bucket `product-photos`.

##### 62. `app/jual/tambah/page.tsx`
* **Fungsi:** Halaman Tambah Produk Baru (`/jual/tambah`).

##### 63. `app/jual/edit/[id]/page.tsx`
* **Fungsi:** Halaman Edit Data Produk (`/jual/edit/[id]`).

##### 64. `app/jual/pendapatan/page.tsx`
* **Fungsi:** Halaman Rekap Pendapatan & Riwayat Payout Penjual (`/jual/pendapatan`).
* **Isi Codingan:** Menampilkan total saldo yang sudah dicairkan, saldo menunggu pencairan, dan riwayat transfer bank dari platform ke rekening penjual.

---

#### User Profile Routes (`app/profil`)

##### 65. `app/profil/page.tsx`
* **Fungsi:** Halaman Profil Pengguna (`/profil`).
* **Isi Codingan:** Tempat mengelola data diri, alamat kos, lokasi peta, data rekening bank, dan mengaktifkan status penjual.

##### 66. `app/profil/profile-form.tsx`
* **Fungsi:** Form pengubahan nama lengkap, email, nomor WhatsApp, dan pilihan kecamatan domisili.

##### 67. `app/profil/seller-section.tsx`
* **Fungsi:** Seksi aktivasi role Penjual (Seller).
* **Isi Codingan:** Tombol untuk beralih menjadi penjual dengan melengkapi alamat kos rinci dan posisi titik koordinat di peta.

##### 68. `app/profil/bank-fields.tsx`
* **Fungsi:** Form input data rekening pencairan dana.
* **Isi Codingan:** Selection pilihan nama bank (`BANK_OPTIONS`), nomor rekening, dan nama pemilik rekening bank.

---

#### Admin SIM Executive Panel Routes (`app/admin`)

##### 69. `app/admin/layout.tsx`
* **Fungsi:** Layout utama Control Panel SIM Admin (`/admin/*`).
* **Isi Codingan:** Dilindungi guard `requireAdmin`. Merender sidebar navigasi admin `AdminSidebar` dan main content area.

##### 70. `app/admin/admin-sidebar.tsx`
* **Fungsi:** Navigasi samping khusus admin.
* **Isi Codingan:** Link ke Executive Dashboard, Kelola Order, Kelola Produk, Kelola User, Pencairan Payouts, dan Audit System Logs.

##### 71. `app/admin/page.tsx`
* **Fungsi:** Executive Summary Dashboard Admin (`/admin`).
* **Isi Codingan:**
  - Widget Live Clock & Theme Switcher.
  - Kartu statistik (Total GMV, Total User, Total Produk, Pending Orders).
  - Rekap total keuntungan platform (*Total Profit*, *Markup Profit*, *Ongkir Profit*).
  - Grafis tren keuntungan via `DashboardProfitChart`.

##### 72. `app/admin/dashboard-profit-chart.tsx`
* **Fungsi:** Komponen grafik visualisasi keuntungan bulanan platform.

##### 73. `app/admin/admin-page-header.tsx` & `app/admin/admin-filters.tsx`
* **Fungsi:** Header halaman admin dan komponen filter global.

##### 74. `app/admin/loading.tsx`
* **Fungsi:** Skeleton loader untuk halaman admin.

##### 75. `app/admin/order/page.tsx` & `app/admin/order/order-management-view.tsx`
* **Fungsi:** Halaman Manajemen Order & Resi WhatsApp Admin (`/admin/order`).
* **Isi Codingan:** Memantau seluruh pesanan di platform, memfilter berdasarkan status order, dan tombol aksi cepat memperbarui status transaksi.

##### 76. `app/admin/order/[orderId]/page.tsx` & `admin-order-actions.tsx`
* **Fungsi:** Halaman Rincian Order Admin (`/admin/order/[orderId]`).
* **Isi Codingan:** Memeriksa bukti transfer pembayaran pembeli, mengubah status order (`Dibayar`, `Dijemput`, `Dalam Pengiriman`, `Selesai`, `Dibatalkan`), dan mencatat log aksi ke `activity_logs`.

##### 77. `app/admin/payout/page.tsx`, `payout-filters.tsx`, `payout-table.tsx`
* **Fungsi:** Halaman Kelola Pencairan Saldo Penjual (`/admin/payout`).
* **Isi Codingan:** Antrian pencairan dana penjual. Admin dapat menekan tombol **"Cairkan Saldo"** setelah mentransfer uang ke rekening penjual, yang memperbarui status payout ke `dicairkan` dan mencatat tanggal pencairan.

##### 78. `app/admin/products/page.tsx`, `product-management.tsx`, `product-modals.tsx`
* **Fungsi:** Halaman Kelola Katalog Produk Admin (`/admin/products`).
* **Isi Codingan:** Memantau seluruh listing barang yang dipasang oleh penjual se-Surabaya, menghentikan tayangan barang ilegal/melanggar, atau mengedit detail produk.

##### 79. `app/admin/users/page.tsx`, `user-filters.tsx`, `user-management-view.tsx`, `user-table.tsx`
* **Fungsi:** Halaman Manajemen User & RBAC (`/admin/users`).
* **Isi Codingan:** Manajemen hak akses pengguna (mengubah role ke admin/seller/buyer), pengelolaan & reset password akun user, verifikasi penjual, atau menonaktifkan akun bermasalah.

##### 80. `app/admin/logs/page.tsx`, `log-filters.tsx`, `log-pagination.tsx`
* **Fungsi:** Halaman Audit Trail & System Activity Logs (`/admin/logs`).
* **Isi Codingan:** Menampilkan catatan log kronologis seluruh tindakan admin di sistem untuk menjaga transparansi dan akuntabilitas manajemen.

---

#### Informational & Guide Routes (`app/bantuan`, `app/faq`, `app/tentang-kami`, `app/ulasan`, `app/panduan`)

##### 81. `app/bantuan/page.tsx`
* **Fungsi:** Halaman Pusat Bantuan Pelanggan.

##### 82. `app/faq/page.tsx`
* **Fungsi:** Halaman Pertanyaan Umum (Frequently Asked Questions) seputar sistem markup, ongkir, dan sistem hold 45 menit.

##### 83. `app/tentang-kami/page.tsx`
* **Fungsi:** Halaman profil perusahaaan / tim pengembang BaranginAja.

##### 84. `app/ulasan/page.tsx`
* **Fungsi:** Halaman testimoni dan ulasan dari pengguna mahasiswa kos Surabaya.

##### 85. `app/panduan/*`
* **Fungsi:** Sub-direktori halaman panduan pengguna (`cara-membeli`, `cara-menjual`, `daftar-penjual`, `keamanan-cod`, `tarif-ongkir`).

---

## 4. 📌 KESIMPULAN

Project **BaranginAja** dirancang secara rapi dan modular dengan pemisahan tugas (*Separation of Concerns*) yang jelas:
1. **Model Bisnis Transparan:** Komisi platform berbasis tiering otomatis dan kalkulasi ongkir berbasis spasial Haversine memberikan kepastian transaksional bagi mahasiswa kos.
2. **Keamanan & Efisiensi Sistem:** Proteksi stok dengan *Lazy Hold Expiration 45 Menit* dan *Middleware SSR Cookies* menjaga konsistensi data tanpa mengorbankan performa server.
3. **Keteraturan Kode:** Struktur Next.js 16 App Router memisahkan komponen reusable UI (`components/`), utilitas logika bisnis (`lib/`), dan route handler aplikasi (`app/`) sehingga sangat mudah dirawat dan dikembangkan lebih lanjut.
