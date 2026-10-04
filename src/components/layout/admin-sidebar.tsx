import { NavLink } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  FolderTree,
  LayoutDashboard,
  ListOrdered,
  ScrollText,
  Server,
  Tags,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/templates", label: "Templates", icon: FileText },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/pricing", label: "Pricing", icon: Tags },
  { to: "/admin/provider-settings", label: "Provider", icon: Server },
  { to: "/admin/stripe", label: "Stripe", icon: CreditCard },
  { to: "/admin/orders", label: "Orders", icon: ListOrdered },
  { to: "/admin/generation-logs", label: "Generation logs", icon: ScrollText },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-steel/60 bg-navy text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-sm font-semibold">Document Studio</p>
        <p className="text-xs text-steel/80">Admin portal</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-electric text-white"
                  : "text-steel hover:bg-white/10 hover:text-white"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-steel transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </NavLink>
      </div>
    </aside>
  );
}
