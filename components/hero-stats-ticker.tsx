"use client";

const advantagesData = [
  {
    highlight: "100% Bebas Penipuan",
    label: "Transaksi Diawasi Admin",
  },
  {
    highlight: "Bebas Komisi Penjual",
    label: "Terima Dana 100% Utuh",
  },
  {
    highlight: "COD Titik Temu Gratis",
    label: "Bebas Ongkir Antar Pembeli & Penjual",
  },
  {
    highlight: "Kurir Surabaya",
    label: "Tarif Jarak & Berat Transparan",
  },
  {
    highlight: "31 Kecamatan Surabaya",
    label: "Jangkauan Komunitas Terverifikasi",
  },
  {
    highlight: "Garansi Aman",
    label: "Dana Diteruskan Setelah Barang Diterima",
  },
];

export function HeroStatsTicker() {
  // Duplikasi untuk seamless loop pada semua resolusi layar
  const duplicatedAdvantages = [
    ...advantagesData,
    ...advantagesData,
    ...advantagesData,
    ...advantagesData,
  ];

  return (
    <div className="relative w-full overflow-hidden bg-white py-3.5 sm:py-4 select-none z-10">
      {/* Left and Right Fade Gradients */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10" />

      {/* Continuous Marquee Ticker */}
      <div className="flex w-max animate-marquee items-center">
        {duplicatedAdvantages.map((item, index) => (
          <div key={index} className="flex items-center shrink-0 px-6 sm:px-10">
            <div className="flex items-center gap-2.5 group cursor-default">
              {/* Highlight Keunggulan */}
              <span className="text-[15px] font-bold text-zinc-950 leading-normal">
                {item.highlight}
              </span>

              {/* Keterangan Keunggulan */}
              <span className="text-[15px] font-normal text-zinc-600 leading-normal whitespace-nowrap">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
