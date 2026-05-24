import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Home, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddUnitModal } from "./add-unit-modal";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireServerUser();

  const property = await prisma.property.findFirst({
    where: { id, landlordId: user.id },
    include: {
      units: {
        where: { isActive: true },
        include: {
          leases: {
            where: { status: "active" },
            include: { tenants: { include: { tenant: true } } },
          },
        },
        orderBy: { unitNumber: "asc" },
      },
      expenses: { orderBy: { date: "desc" }, take: 5 },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!property) notFound();

  const totalRent = property.units.reduce((sum, u) => sum + (u.leases[0]?.monthlyRent || 0), 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/dashboard/properties" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> Properties
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1A2332]">{property.nickname}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={12} /> {property.address}, {property.city}, {property.state} {property.zip}
            </p>
            <p className="text-xs text-gray-400 mt-1 capitalize">{property.propertyType.replace("_", " ")}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatCurrency(totalRent)}<span className="text-sm font-normal text-gray-500">/mo</span></p>
            <p className="text-xs text-gray-500">{property.units.filter(u => u.leases.length > 0).length}/{property.units.length} occupied</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Units</h2>
        <AddUnitModal propertyId={property.id} />
      </div>

      <div className="grid gap-3">
        {property.units.map((unit) => {
          const lease = unit.leases[0];
          const tenants = lease?.tenants.map((lt) => lt.tenant.name).join(", ") || null;
          return (
            <Link
              key={unit.id}
              href={`/dashboard/properties/${property.id}/units/${unit.id}`}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-[#C4622D]/30 hover:shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Home size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-[#C4622D] transition-colors">Unit {unit.unitNumber}</p>
                  <p className="text-xs text-gray-500">{unit.bedrooms}bd / {unit.bathrooms}ba{unit.squareFeet ? ` · ${unit.squareFeet} sqft` : ""}</p>
                </div>
              </div>
              <div className="text-right">
                {lease ? (
                  <>
                    <p className="text-sm font-medium">{formatCurrency(lease.monthlyRent)}/mo</p>
                    <p className="text-xs text-gray-500">{tenants}</p>
                    {lease.endDate && (
                      <p className="text-xs text-gray-400">Lease ends {formatDate(lease.endDate)}</p>
                    )}
                  </>
                ) : (
                  <Badge variant="yellow">Vacant</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
