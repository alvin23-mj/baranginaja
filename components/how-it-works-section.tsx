import Link from "next/link";

export function HowItWorksSection() {
  return (
    <section className="relative w-full bg-[#111111] text-white py-14 sm:py-18 lg:py-20 overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block mb-2">
            PINDAHAN KOS ATAU MAU WISUDA?
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight">
            Ubah Barang Kos Bekas Jadi Uang Tunai
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
            Pasang iklan gratis dalam 2 menit. 100% uang penjualan masuk utuh ke rekeningmu tanpa potongan komisi sepeser pun.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Link
            href="/jual"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200 shadow-sm"
          >
            Mulai Jual Barang
          </Link>
          <Link
            href="/profil"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-transparent px-6 py-3.5 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
          >
            Daftar Akun Penjual
          </Link>
        </div>
      </div>

      {/* Logo BaranginAja di Kanan Bawah */}
      <div
        aria-hidden="true"
        className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 lg:bottom-5 lg:right-10 select-none pointer-events-none"
      >
        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-500/40">
          barangin<span className="text-zinc-600/40">aja</span>
        </span>
      </div>
    </section>
  );
}
