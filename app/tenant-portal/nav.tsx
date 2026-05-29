"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Receipt, MessageSquare, FileText } from "lucide-react";

const tabs = [
  { href: "/tenant-portal", label: "Home", icon: Home },
  { href: "/tenant-portal/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/tenant-portal/payments", label: "Payments", icon: Receipt },
  { href: "/tenant-portal/messages", label: "Messages", icon: MessageSquare },
  { href: "/tenant-portal/documents", label: "Documents", icon: FileText },
];

export function TenantNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/tenant-portal" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
