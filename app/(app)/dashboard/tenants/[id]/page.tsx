import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, monthName } from "@/lib/utils";
import { SendPortalLinkButton } from "./send-portal-link-button";

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireServerUser();

  const tenant = await prisma.tenant.findFirst({
    where: { id, landlordId: user.id },
    include: {
      leases: {
        include: {
          lease: {
            include: {
              unit: { include: { property: true } },
              rentPayments: { orderBy: { periodYear: "desc" } },
            },
          },
        },
      },
      maintenanceRequests: { orderBy: { submittedAt: "desc" }, take: 10 },
    },
  });

  if (!tenant) notFound();

  const activeLeaseTenant = tenant.leases.find((lt) => lt.lease.status === "active");
  const activeLease = activeLeaseTenant?.lease;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/dashboard/tenants" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> Tenants
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1A2332]">{tenant.name}</h1>
            {tenant.email && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1"><Mail size={12} />{tenant.email}</p>
            )}
            {tenant.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5"><Phone size={12} />{tenant.phone}</p>
            )}
          </div>
          {activeLease && tenant.email && (
            <SendPortalLinkButton tenantId={tenant.id} leaseId={activeLease.id} />
          )}
        </div>
        {tenant.emergencyContactName && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Emergency contact</p>
            <p className="text-sm">{tenant.emergencyContactName} {tenant.emergencyContactPhone && `— ${tenant.emergencyContactPhone}`}</p>
          </div>
        )}
        {tenant.notes && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">Notes</p>
            <p className="text-sm">{tenant.notes}</p>
          </div>
        )}
      </div>

      {activeLease && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Current Lease</h2>
            <Link href={`/dashboard/leases/${activeLease.id}`} className="text-xs text-[#C4622D] hover:underline">View →</Link>
          </div>
          <p className="text-sm text-gray-600">{activeLease.unit.property.address}, Unit {activeLease.unit.unitNumber}</p>
          <p className="text-sm">{formatCurrency(activeLease.monthlyRent)}/mo · Due day {activeLease.rentDueDay}</p>
        </div>
      )}

      {activeLease && activeLease.rentPayments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold mb-4">Payment History</h2>
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
              {activeLease.rentPayments.slice(0, 12).map((p) => (
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

      {tenant.maintenanceRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold mb-4">Maintenance Requests</h2>
          <div className="space-y-3">
            {tenant.maintenanceRequests.map((req) => (
              <Link key={req.id} href={`/dashboard/maintenance/${req.id}`} className="flex items-center justify-between text-sm hover:text-[#C4622D]">
                <span>{req.title}</span>
                <Badge variant={req.status === "resolved" ? "green" : "yellow"}>{req.status}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
