"use client";

import { useState } from "react";
import Image from "next/image";

export function ContactSection() {
  const [formData, setFormData] = useState({
    nama: "",
    kontak: "",
    kategori: "Pertanyaan Umum",
    pesan: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.kontak.trim() || !formData.pesan.trim()) {
      return;
    }

    setStatus("submitting");

    // Simulasi pengiriman pesan
    setTimeout(() => {
      setStatus("success");
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      nama: "",
      kontak: "",
      kategori: "Pertanyaan Umum",
      pesan: "",
    });
    setStatus("idle");
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Halo Tim BaranginAja,\n\nNama: ${formData.nama || "-"}\nKontak: ${
        formData.kontak || "-"
      }\nKategori: ${formData.kategori}\nPesan: ${formData.pesan || "Halo, saya ingin bertanya seputar layanan BaranginAja."}`
    );
    window.open(`https://wa.me/6281234567890?text=${text}`, "_blank");
  };

  return (
    <section id="hubungi-kami" className="w-full bg-[#f0f0f0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white border border-zinc-200/80 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Sisi Kiri: Gambar AI Layanan Bantuan */}
            <div className="relative lg:col-span-5 min-h-[360px] sm:min-h-[440px] lg:min-h-full overflow-hidden bg-zinc-950 flex items-center justify-center">
              <Image
                src="/images/contact-support.jpg"
                alt="Layanan Bantuan BaranginAja"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>

            {/* Sisi Kanan: Form Kontak Interaktif */}
            <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              {status === "success" ? (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-zinc-900">
                    Pesan Berhasil Terkirim!
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                    Terima kasih telah menghubungi kami. Tim BaranginAja akan segera menindaklanjuti dan merespons ke kontak Anda.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
                    >
                      Kirim Pesan Lain
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppDirect}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-zinc-300 text-zinc-800 text-sm font-medium hover:bg-zinc-100 transition-colors"
                    >
                      Buka di WhatsApp
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-normal text-zinc-900 tracking-tight">
                      Kirim Pesan Langsung
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Isi formulir berikut, tim kami akan merespons secepatnya.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nama Lengkap */}
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-zinc-700 mb-1.5">
                        Nama Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                      />
                    </div>

                    {/* Email / WhatsApp */}
                    <div>
                      <label htmlFor="contact-info" className="block text-sm font-medium text-zinc-700 mb-1.5">
                        No. WhatsApp / Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-info"
                        type="text"
                        required
                        placeholder="0812xxxx atau email@kamu.com"
                        value={formData.kontak}
                        onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Kategori Pertanyaan */}
                  <div>
                    <label htmlFor="contact-category" className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Kategori Pertanyaan
                    </label>
                    <div className="relative">
                      <select
                        id="contact-category"
                        value={formData.kategori}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-zinc-300 bg-white pl-4 pr-11 py-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
                      >
                        <option value="Pertanyaan Umum">Pertanyaan Umum & Cara Jual-Beli</option>
                        <option value="Kendala Transaksi / COD">Kendala Transaksi / COD</option>
                        <option value="Verifikasi Akun / Profil">Verifikasi Akun & Profil</option>
                        <option value="Lapor Barang / Pengguna">Lapor Barang Mencurigakan</option>
                        <option value="Kemitraan & Kerjasama">Kemitraan Kampus / Kos</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Pesan */}
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Pesan atau Pertanyaan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      placeholder="Tuliskan kendala, pertanyaan, atau saran Anda secara detail di sini..."
                      value={formData.pesan}
                      onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all resize-y min-h-[100px]"
                    />
                  </div>

                  {/* Tombol Aksi */}
                  <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-70 shadow-sm cursor-pointer"
                    >
                      {status === "submitting" ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Pesan</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>

                    <div className="relative w-full sm:w-auto">
                      {/* Label Rekomendasi di atas tombol WhatsApp (Warna kuning muda / light amber) */}
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-amber-400 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap pointer-events-none z-10">
                        <svg className="w-2.5 h-2.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>Rekomendasi</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleWhatsAppDirect}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3.5 text-sm font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        <span>Chat via WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
