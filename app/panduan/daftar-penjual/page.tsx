import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SellerSection } from "@/app/profil/seller-section";
import type { UserWithKampus } from "@/lib/types/database";

export const metadata = {
  title: "Daftar Jadi Penjual - BaranginAja",
  description: "Form pendaftaran akun penjual BaranginAja.",
};

export default async function DaftarPenjualPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirectTo=/panduan/daftar-penjual");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*, kecamatan:districts(id, nama_kecamatan)")
    .eq("id", authUser.id)
    .single();

  if (!profile) {
    redirect("/login?redirectTo=/panduan/daftar-penjual");
  }

  const user = profile as UserWithKampus;

  return (
    <main className="flex-1 bg-[#f0f0f0] text-zinc-900">
      {/* 1. Hero Banner Full-Width (Samakan dengan Tentang Kami) */}
      <section className="w-full overflow-hidden bg-zinc-950">
        <Image
          src="/images/about-hero.jpg"
          alt="Bergabung Menjadi Penjual di BaranginAja"
          width={1920}
          height={800}
          priority
          className="w-full h-auto object-cover max-h-[220px] sm:max-h-[280px] lg:max-h-[340px] opacity-90"
        />
      </section>

      {/* 2. Konten Utama */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-20 lg:py-28 space-y-12 sm:space-y-24">
        
        {/* Header Editorial Title */}
        <section className="text-center max-w-4xl lg:max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <h1
            className="text-2xl sm:text-4xl lg:text-5xl tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.25] text-balance"
            style={{
              fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
              fontWeight: 300,
            }}
          >
            Pendaftaran Akun Penjual
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed sm:leading-loose max-w-3xl mx-auto">
            Lengkapi data rekening dan unggah KTM Anda di bawah ini untuk mengaktifkan fitur berjualan dan bergabung dengan komunitas BaranginAja.
          </p>
        </section>

        {/* Form Pendaftaran */}
        <section className="mx-auto w-full max-w-7xl">
          <SellerSection user={user} />
        </section>

      </div>
    </main>
  );
}
