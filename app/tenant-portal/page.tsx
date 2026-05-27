import { requireTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, monthName, currentPeriod } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Wrench, FileText, Phone, Mail } from "lucide-react";

export default async function TenantPortalPage() {
  const session = await requireTenantUser();
  const { month, year } = currentPeriod();

  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) redirect("/tenant-portal/auth");

  const landlord = await prisma.landlord.findUnique({
    where: { id: session.landlordId },
    select: { name: true, email: true, phone: true, showEmailToTenants: true, showPhoneToTenants: true },
  });

  const lease = await prisma.lease.findUnique({
    where: { id: session.leaseId },
    include: { unit: { include: { property: true } } },
  });

  if (!lease) redirect("/tenant-portal/auth");

  const currentPayment = await prisma.rentPayment.findFirst({
    where: { leaseId: session.leaseId, periodMonth: month, periodYear: year },
  });

  const recentPayments = await prisma.rentPayment.findMany({
    where: { leaseId: session.leaseId },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    take: 6,
  });

  const openRequests = await prisma.maintenanceRequest.findMany({
    where: { tenantId: session.tenantId, status: { not: "resolved" } },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A2332]">Hi {tenant.name}</h1>
        <p className="text-sm text-gray-500">{addr}</p>
      </div>

      {/* Current rent status */}
      <div className={`rounded-xl p-6 ${currentPayment?.status === "paid" ? "bg-green-50 border border-green-200" : "bg-white border border-gray-100"}`}>
        <p className="text-sm font-medium text-gray-600 mb-2">{monthName(month)} {year} Rent</p>
        {currentPayment ? (
          <>
            <p className="text-3xl font-bold text-[#1A2332] mb-2">{formatCurrency(currentPayment.totalAmount)}</p>
            {currentPayment.status === "paid" ? (
              <div>
                <Badge variant="green" className="text-sm px-3 py-1">Paid on {currentPayment.paidAt ? formatDate(currentPayment.paidAt) : "—"}</Badge>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Due: {formatDate(currentPayment.dueDate)}</p>
                {currentPayment.stripePaymentUrl ? (
                  <a href={currentPayment.stripePaymentUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" size="lg">Pay Now</Button>
                  </a>
                ) : (
                  <Link href="/tenant-portal/pay">
                    <Button className="w-full" size="lg">Pay Online</Button>
                  </Link>
                )}
                {currentPayment.lateFee > 0 && (
                  <p className="text-xs text-red-600">Includes ${currentPayment.lateFee.toFixed(2)} late fee</p>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">No rent charge found for this month. Contact your landlord.</p>
        )}
      </div>

      {/* Payment history */}
      {recentPayments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Recent Payments</h2>
          <div className="space-y-2">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{monthName(p.periodMonth)} {p.periodYear}</span>
                <div className="flex items-center gap-2">
                  <span>{formatCurrency(p.totalAmount)}</span>
                  <Badge variant={p.status === "paid" ? "green" : "yellow"}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/tenant-portal/maintenance/new" className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-[#C4622D]/30 transition">
          <Wrench size={20} className="mx-auto text-gray-400 mb-1" />
          <p className="text-xs font-medium text-gray-700">Maintenance</p>
        </Link>
        <Link href="/tenant-portal/documents" className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-[#C4622D]/30 transition">
          <FileText size={20} className="mx-auto text-gray-400 mb-1" />
          <p className="text-xs font-medium text-gray-700">Documents</p>
        </Link>
        <Link href="/tenant-portal/maintenance" className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-[#C4622D]/30 transition">
          <DollarSign size={20} className="mx-auto text-gray-400 mb-1" />
          <p className="text-xs font-medium text-gray-700">History</p>
        </Link>
      </div>

      {/* Utilities */}
      {lease.unit.utilitiesIncluded.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Utilities Included in Rent</h2>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {lease.unit.utilitiesIncluded.map((u) => (
              <span key={u} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{u}</span>
            ))}
          </div>
          {lease.unit.utilitiesNote && (
            <p className="text-xs text-gray-500">{lease.unit.utilitiesNote}</p>
          )}
        </div>
      )}

      {/* Contact landlord */}
      {landlord && (landlord.showEmailToTenants || landlord.showPhoneToTenants) && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Contact Your Landlord</h2>
          <p className="text-sm text-gray-500 mb-3">{landlord.name}</p>
          <div className="flex flex-col gap-2">
            {landlord.showPhoneToTenants && landlord.phone && (
              <a
                href={`tel:${landlord.phone}`}
                className="flex items-center gap-2 text-sm font-medium text-[#1A2332] hover:text-[#C4622D] transition"
              >
                <Phone size={15} className="text-gray-400" />
                {landlord.phone}
              </a>
            )}
            {landlord.showEmailToTenants && landlord.email && (
              <a
                href={`mailto:${landlord.email}`}
                className="flex items-center gap-2 text-sm font-medium text-[#1A2332] hover:text-[#C4622D] transition"
              >
                <Mail size={15} className="text-gray-400" />
                {landlord.email}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Open maintenance */}
      {openRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Open Maintenance Requests</h2>
          <div className="space-y-3">
            {openRequests.map((req) => (
              <div key={req.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{req.title}</span>
                <Badge variant={req.status === "resolved" ? "green" : req.status === "in_progress" ? "blue" : "yellow"} className="capitalize">
                  {req.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
