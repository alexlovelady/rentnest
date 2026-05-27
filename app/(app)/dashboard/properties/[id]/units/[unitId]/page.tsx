import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, monthName } from "@/lib/utils";
import { UtilitiesForm } from "./utilities-form";

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string; unitId: string }> }) {
  const { id, unitId } = await params;
  const user = await requireServerUser();

  const unit = await prisma.unit.findFirst({
    where: { id: unitId, property: { landlordId: user.id } },
    include: {
      property: true,
      leases: {
        include: {
          tenants: { include: { tenant: true } },
          rentPayments: { orderBy: { periodYear: "desc" }, take: 24 },
        },
        orderBy: { createdAt: "desc" },
      },
      maintenanceRequests: { orderBy: { submittedAt: "desc" }, take: 10 },
    },
  });

  if (!unit) notFound();

  const activeLease = unit.leases.find((l) => l.status === "active");

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link href={`/dashboard/properties/${id}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> {unit.property.nickname}
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h1 className="text-xl font-bold text-[#1A2332]">Unit {unit.unitNumber}</h1>
        <p className="text-sm text-gray-500">{unit.bedrooms}bd / {unit.bathrooms}ba{unit.squareFeet ? ` · ${unit.squareFeet} sqft` : ""}</p>
      </div>

      {activeLease ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Current Lease</h2>
            <Link href={`/dashboard/leases/${activeLease.id}`} className="text-xs text-[#C4622D] hover:underline">View full lease →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Tenants</p>
              <p className="font-medium">{activeLease.tenants.map(lt => lt.tenant.name).join(", ")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly rent</p>
              <p className="font-medium">{formatCurrency(activeLease.monthlyRent)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Start date</p>
              <p className="font-medium">{formatDate(activeLease.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">End date</p>
              <p className="font-medium">{activeLease.endDate ? formatDate(activeLease.endDate) : "Month-to-month"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-yellow-800">Unit is vacant</p>
            <p className="text-sm text-yellow-600">No active lease for this unit.</p>
          </div>
          <Link href={`/dashboard/leases/new?unitId=${unitId}`} className="text-sm bg-[#C4622D] text-white px-4 py-2 rounded-lg hover:bg-[#a8522a] transition">
            Add Lease
          </Link>
        </div>
      )}

      {activeLease && activeLease.rentPayments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Rent Payment History</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left pb-2">Period</th>
                <th className="text-left pb-2">Amount</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-left pb-2">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeLease.rentPayments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2">{monthName(p.periodMonth)} {p.periodYear}</td>
                  <td className="py-2">{formatCurrency(p.totalAmount)}</td>
                  <td className="py-2">
                    <Badge variant={p.status === "paid" ? "green" : p.status === "pending" ? "yellow" : "red"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-gray-500">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Utilities */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Utilities Included in Rent</h2>
        <UtilitiesForm
          unitId={unit.id}
          propertyId={id}
          utilitiesIncluded={unit.utilitiesIncluded}
          utilitiesNote={unit.utilitiesNote ?? null}
        />
      </div>

      {unit.maintenanceRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Maintenance</h2>
          <div className="space-y-3">
            {unit.maintenanceRequests.map((req) => (
              <Link key={req.id} href={`/dashboard/maintenance/${req.id}`} className="flex items-center justify-between hover:text-[#C4622D] transition-colors">
                <div>
                  <p className="text-sm font-medium">{req.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{req.category} · {req.priority}</p>
                </div>
                <Badge variant={req.status === "resolved" ? "green" : req.priority === "emergency" ? "red" : "yellow"}>
                  {req.status.replace("_", " ")}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
