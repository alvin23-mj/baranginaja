import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="flex-1 bg-[#f0f0f0] dark:bg-[#0e0e10] font-sans">
      <div className="w-full">{children}</div>
    </main>
  );
}
