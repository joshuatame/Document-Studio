import { NavLink } from "react-router-dom";
import {
  ExternalLink,
  FilePlus,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { getUser, isAdminUser, logoutAndRedirect } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/select", label: "New Document", icon: FilePlus },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const user = getUser();
  const showAdmin = isAdminUser(user);

  function handleSignOut() {
    logoutAndRedirect();
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-steel/60 bg-white">
      <div className="border-b border-steel/60 px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy">
            <span className="text-sm font-bold text-white">TD</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">Tame Dynamics</p>
            <p className="text-xs text-graphite/70">Document Studio</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-electric/10 text-electric"
                  : "text-graphite hover:bg-steel/40 hover:text-navy"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        {showAdmin && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo/10 text-indigo"
                  : "text-graphite hover:bg-steel/40 hover:text-navy"
              )
            }
          >
            <Shield className="h-4 w-4" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="space-y-1 border-t border-steel/60 px-3 py-4">
        {(user?.displayName || user?.email) && (
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-navy">
              {user.displayName || user.email}
            </p>
            {user.displayName && user.email && (
              <p className="truncate text-xs text-graphite/70">{user.email}</p>
            )}
          </div>
        )}
        <a
          href="https://tame-dynamics.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-graphite transition-colors hover:bg-steel/40 hover:text-navy"
        >
          <ExternalLink className="h-4 w-4" />
          tame-dynamics.com
        </a>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-graphite transition-colors hover:bg-error/10 hover:text-error"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
