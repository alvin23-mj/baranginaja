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
    <main className="flex min-h-screen flex-1 items-center justify-center bg-zinc-50/60 px-4 py-10 sm:py-16 dark:bg-black">
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />}>
        <AuthCard districts={districts} />
      </Suspense>
    </main>
  );
}
