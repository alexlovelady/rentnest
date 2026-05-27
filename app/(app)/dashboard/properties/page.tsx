import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { NewPropertyModal } from "./new-property-modal";

export default async function PropertiesPage() {
  const user = await requireServerUser();

  const properties = await prisma.property.findMany({
    where: { landlordId: user.id, isActive: true },
    include: {
      units: {
        where: { isActive: true },
        include: {
          leases: {
            where: { status: "active" },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">{properties.length} propert{properties.length === 1 ? "y" : "ies"}</p>
        </div>
        <NewPropertyModal />
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No properties yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first property to get started.</p>
          <NewPropertyModal />
        </div>
      ) : (
        <div className="grid gap-4">
          {properties.map((property) => {
            const totalUnits = property.units.length;
            const occupiedUnits = property.units.filter((u) => u.leases.length > 0).length;
            const monthlyRent = property.units.reduce((sum, u) => {
              const lease = u.leases[0];
              return sum + (lease?.monthlyRent || 0);
            }, 0);

            return (
              <Link
                key={property.id}
                href={`/dashboard/properties/${property.id}`}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {property.photoUrl ? (
                      <img src={property.photoUrl} alt={property.nickname} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Home size={18} className="text-primary" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {property.nickname}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {property.address}, {property.city}, {property.state}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {property.propertyType.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(monthlyRent)}/mo</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {occupiedUnits}/{totalUnits} units occupied
                    </p>
                    <div className="flex gap-1.5 mt-2 justify-end">
                      {occupiedUnits < totalUnits && (
                        <Badge variant="yellow">{totalUnits - occupiedUnits} vacant</Badge>
                      )}
                      {occupiedUnits === totalUnits && totalUnits > 0 && (
                        <Badge variant="green">Fully occupied</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
