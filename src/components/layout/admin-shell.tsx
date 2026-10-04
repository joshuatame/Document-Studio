import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export function AdminShell() {
  return (
    <div className="flex min-h-screen bg-steel/20">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
