import { redirect } from "next/navigation";
import { requireServerUser } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireServerUser();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
