import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Globe } from "lucide-react";
import { VendorForm } from "./vendor-form";

const TRADES = ["general", "plumber", "electrician", "HVAC", "handyman", "painter", "roofer", "landscaper", "locksmith", "cleaner", "pest control", "appliance repair"];

export default async function VendorsPage() {
  const user = await requireServerUser();

  const vendors = await prisma.vendor.findMany({
    where: { landlordId: user.id, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link href="/dashboard/maintenance" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> Maintenance
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Vendors</h1>
          <p className="text-sm text-gray-500">Save contractor info to quickly assign to maintenance jobs.</p>
        </div>
        <VendorForm trades={TRADES} />
      </div>

      {vendors.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-10 text-center">
          <p className="text-gray-500 text-sm">No vendors yet. Add your first contractor above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vendors.map((v) => (
            <div key={v.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-slate-dark">{v.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{v.trade}</p>
                </div>
                <VendorForm vendor={v} trades={TRADES} />
              </div>
              <div className="space-y-1 mt-3">
                {v.phone && (
                  <a href={`tel:${v.phone}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary">
                    <Phone size={12} className="text-gray-400" /> {v.phone}
                  </a>
                )}
                {v.email && (
                  <a href={`mailto:${v.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary">
                    <Mail size={12} className="text-gray-400" /> {v.email}
                  </a>
                )}
                {v.website && (
                  <a href={v.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary">
                    <Globe size={12} className="text-gray-400" /> {v.website}
                  </a>
                )}
              </div>
              {v.notes && <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">{v.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
