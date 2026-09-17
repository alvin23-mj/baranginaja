import Link from "next/link";

interface CategoryData {
  id?: string;
  nama_kategori?: string;
}

interface CategoryShowcaseProps {
  categories?: CategoryData[];
}

interface ShowcaseItem {
  number: string;
  keyword: string;
  fallbackSlug: string;
  title: string;
  objectsCount: string;
  description: string;
  ctaText: string;
  imageUrl: string;
  staggerClass: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    number: "01",
    keyword: "perabot",
    fallbackSlug: "perabot",
    title: "Perabot & Kamar Kost",
    objectsCount: "18 Barang",
    description: "Meja belajar, kursi, lemari, dan perlengkapan kos siap pakai.",
    ctaText: "JELAJAHI PERABOT",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
    staggerClass: "lg:translate-y-0",
  },
  {
    number: "02",
    keyword: "elektronik",
    fallbackSlug: "elektronik",
    title: "Elektronik & Gadget",
    objectsCount: "12 Barang",
    description: "Monitor, keyboard, audio, dan periferal penunjang studi.",
    ctaText: "JELAJAHI ELEKTRONIK",
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    staggerClass: "lg:translate-y-8",
  },
  {
    number: "03",
    keyword: "buku",
    fallbackSlug: "buku",
    title: "Buku & Diktat Kuliah",
    objectsCount: "09 Barang",
    description: "Buku teks kuliah, diktat, dan materi catatan mahasiswa.",
    ctaText: "JELAJAHI BUKU",
    imageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    staggerClass: "lg:translate-y-0",
  },
  {
    number: "04",
    keyword: "transportasi",
    fallbackSlug: "transportasi",
    title: "Transportasi & Hobi",
    objectsCount: "07 Barang",
    description: "Sepeda kampus, helm SNI, dan perlengkapan hobi mahasiswa.",
    ctaText: "JELAJAHI HOBI",
    imageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80",
    staggerClass: "lg:translate-y-8",
  },
];

export function CategoryShowcase({ categories = [] }: CategoryShowcaseProps) {
  // Helper to resolve actual category link if DB categories match keywords
  const getCategoryHref = (item: ShowcaseItem) => {
    const matched = categories.find((c) =>
      c.nama_kategori?.toLowerCase().includes(item.keyword)
    );
    const categoryParam = matched?.id || item.fallbackSlug;
    return `/produk?kategori=${encodeURIComponent(categoryParam)}`;
  };

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            KATEGORI PILIHAN MAHASISWA
          </p>
          <h2 className="mt-1 text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-zinc-950">
            Jelajahi Berdasarkan Kebutuhan
          </h2>
        </div>

        {/* 4 Cards Grid with Alternating Stagger */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-start">
          {SHOWCASE_ITEMS.map((item) => {
            const href = getCategoryHref(item);

            return (
              <Link
                key={item.number}
                href={href}
                className={`group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-200 hover:shadow-lg ${item.staggerClass}`}
              >
                {/* Image Container with Badges (Panjang aspect-[4/5], Tanpa Animasi Zoom) */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />

                  {/* Top-Left Number Tag */}
                  <div className="absolute top-3 left-3 rounded bg-white/95 px-2 py-0.5 text-xs font-bold text-zinc-900 shadow-xs backdrop-blur-xs">
                    {item.number}
                  </div>

                  {/* Bottom-Right Count Badge */}
                  <div className="absolute bottom-3 right-3 rounded bg-zinc-950/85 px-2.5 py-1 text-[11px] font-medium text-white shadow-xs backdrop-blur-xs tracking-wide">
                    {item.objectsCount}
                  </div>
                </div>

                {/* Card Text Content */}
                <div className="flex flex-col gap-1.5 p-3.5 sm:p-4">
                  <h3 className="text-base sm:text-lg lg:text-xl font-medium text-zinc-950">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-600 line-clamp-2 sm:line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
