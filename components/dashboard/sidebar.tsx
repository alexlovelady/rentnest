"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home, Building2, Users, FileText, DollarSign, Wrench,
  Receipt, FolderOpen, BarChart3, Settings, LogOut, Menu, X,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/tenants", label: "Tenants", icon: Users },
  { href: "/dashboard/leases", label: "Leases", icon: FileText },
  { href: "/dashboard/rent", label: "Rent", icon: DollarSign },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/documents", label: "Documents", icon: FolderOpen },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

async function handleSignOut() {
  await fetch("/api/session", { method: "DELETE" });
  window.location.href = "/login";
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <>
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 w-full transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-slate-dark flex-col h-full shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-white font-bold text-lg tracking-tight">RentNest</span>
        </div>
        {navLinks}
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-slate-dark h-14 px-4 flex items-center justify-between">
        <span className="text-white font-bold text-lg tracking-tight">RentNest</span>
        <button onClick={() => setOpen(true)} className="text-white p-1 -mr-1" aria-label="Open menu">
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <aside className="w-64 bg-slate-dark flex flex-col h-full">
            <div className="px-5 h-14 border-b border-white/10 flex items-center justify-between">
              <span className="text-white font-bold text-lg tracking-tight">RentNest</span>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white -mr-1" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            {navLinks}
          </aside>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
