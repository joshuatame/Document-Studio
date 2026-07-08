import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-steel/60 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy">
            <span className="text-xs font-bold text-white">TD</span>
          </div>
          <span className="text-sm font-semibold text-navy">Document Studio</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-graphite hover:bg-steel/40"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 shadow-elevated">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
