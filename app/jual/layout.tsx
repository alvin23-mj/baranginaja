import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserSidebar } from "@/components/user-sidebar";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirectTo=/jual");
  }

  const { count: pendingCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", authUser.id)
    .eq("status", "Menunggu Pembayaran");

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#f4f5f7] dark:bg-[#0e0e10] font-sans">
      {/* Sidebar Warna Putih */}
      <UserSidebar pendingBuyerOrdersCount={pendingCount ?? 0} />

      {/* Isi Body Kanan Warna Abu-Abu - Container Fluid */}
      <main className="flex-1 min-w-0 bg-[#f4f5f7] dark:bg-[#0e0e10] overflow-y-auto">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
