import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const { user } = await requireAdmin(supabase, "/admin");

  // Fetch admin user profile info for sidebar display
  const { data: profile } = await supabase
    .from("users")
    .select("nama_lengkap")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 font-sans">
      <AdminSidebar
        adminName={profile?.nama_lengkap ?? "Admin"}
        adminEmail={user.email ?? null}
      />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
