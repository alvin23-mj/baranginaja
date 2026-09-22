import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDistricts } from "@/lib/districts";
import { AuthCard } from "./auth-card";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/");
    }
  }

  const districts = await getDistricts(supabase);

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center bg-zinc-50 dark:bg-[#0c0c0e] px-4 py-10 sm:py-16 overflow-hidden transition-colors">
      {/* Ambient Soft Blurred Background Orbs (Non-distracting, Subtle Mesh Glow) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
        {/* Top-left subtle indigo/blue orb */}
        <div className="absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent blur-[120px] dark:from-blue-600/15 dark:via-indigo-600/10" />

        {/* Bottom-right subtle amber/emerald orb */}
        <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-gradient-to-tl from-amber-500/15 via-emerald-500/10 to-transparent blur-[120px] dark:from-amber-600/10 dark:via-emerald-600/10" />

        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-md" />}>
          <AuthCard districts={districts} />
        </Suspense>
      </div>
    </main>
  );
}
