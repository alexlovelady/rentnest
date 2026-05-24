import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NewTenantModal } from "./new-tenant-modal";

export default async function TenantsPage() {
  const user = await requireServerUser();

  const tenants = await prisma.tenant.findMany({
    where: { landlordId: user.id, isActive: true },
    include: {
      leases: {
        include: {
          lease: {
            include: { unit: { include: { property: true } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">Tenants</h1>
          <p className="text-sm text-gray-500 mt-1">{tenants.length} tenant{tenants.length !== 1 ? "s" : ""}</p>
        </div>
        <NewTenantModal />
      </div>

      {tenants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No tenants yet</h3>
          <p className="text-sm text-gray-500 mb-4">Tenants are created when you set up a lease.</p>
          <NewTenantModal />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {tenants.map((tenant) => {
            const activeLease = tenant.leases.find((lt) => lt.lease.status === "active");
            const addr = activeLease
              ? `${activeLease.lease.unit.property.address}, Unit ${activeLease.lease.unit.unitNumber}`
              : null;
            return (
              <Link
                key={tenant.id}
                href={`/dashboard/tenants/${tenant.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{tenant.name}</p>
                  <p className="text-sm text-gray-500">{tenant.email || "No email"}</p>
                  {addr && <p className="text-xs text-gray-400">{addr}</p>}
                </div>
                <div className="text-right">
                  {activeLease ? (
                    <Badge variant="green">Active</Badge>
                  ) : (
                    <Badge variant="gray">No active lease</Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
