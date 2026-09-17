import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          const { data: existingUser } = await supabase
            .from("users")
            .select("id, role")
            .eq("id", user.id)
            .maybeSingle();

          if (!existingUser) {
            await supabase.from("users").insert({
              id: user.id,
              email: user.email,
              nama_lengkap:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split("@")[0] ||
                "Pengguna",
              role: "buyer",
              is_seller: false,
              status_verifikasi: "pending",
              no_hp: user.user_metadata?.phone || "",
            });
          }

          if (existingUser?.role === "admin") {
            return NextResponse.redirect(`${origin}/admin`);
          }
        } catch (profileErr) {
          console.error("Gagal sinkronisasi profil user OAuth:", profileErr);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
