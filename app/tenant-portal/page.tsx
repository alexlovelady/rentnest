import { requireTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, monthName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Plus } from "lucide-react";
import LeaseTerminatedPage from "./lease-terminated";
import { PayDepositButton } from "./pay-deposit-button";
import { PayRentButton } from "./pay-rent-button";

function ordinal(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  const s = ["th", "st", "nd", "rd"];
  return n + (s[n % 10] || "th");
}

export default async function TenantPortalPage({ searchParams }: { searchParams: Promise<{ deposit_paid?: string }> }) {
  const session = await requireTenantUser();
  const { deposit_paid } = await searchParams;

  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) redirect("/tenant-portal/auth");

  const landlord = await prisma.landlord.findUnique({
    where: { id: session.landlordId },
    select: { name: true, email: true, phone: true, showEmailToTenants: true, showPhoneToTenants: true, stripeConnectReady: true },
  });

  const lease = await prisma.lease.findUnique({
    where: { id: session.leaseId },
    include: { unit: { include: { property: true } } },
  });

  if (!lease) redirect("/tenant-portal/auth");
  if (lease.status === "terminated") {
    return <LeaseTerminatedPage tenant={tenant} lease={lease} />;
  }

  const now = new Date();

  // Most recent paid charge (for "last paid" context)
  const lastPaid = await prisma.rentPayment.findFirst({
    where: { leaseId: session.leaseId, status: "paid" },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  });

  const allUnpaid = await prisma.rentPayment.findMany({
    where: { leaseId: session.leaseId, status: "pending" },
    orderBy: [{ dueDate: "asc" }],
  });

  // Featured = earliest pending charge (upcoming or overdue)
  const featuredPayment = allUnpaid[0] ?? null;
  // Remaining pending charges beyond the featured one
  const otherUnpaid = allUnpaid.slice(1);
  // Split others into overdue vs upcoming
  const otherOverdue = otherUnpaid.filter((p) => new Date(p.dueDate) < now);
  const otherUpcoming = otherUnpaid.filter((p) => new Date(p.dueDate) >= now);

  const openRequests = await prisma.maintenanceRequest.findMany({
    where: { tenantId: session.tenantId, status: { not: "resolved" } },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-dark">Hi, {tenant.name.split(" ")[0]}</h1>
        <p className="text-sm text-gray-500">{addr}</p>
      </div>

      {/* Featured rent charge — earliest pending, or last paid if all caught up */}
      {featuredPayment ? (
        <div className={`rounded-xl p-5 ${new Date(featuredPayment.dueDate) < now ? "bg-red-50 border border-red-200" : "bg-white border border-gray-100"}`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {monthName(featuredPayment.periodMonth)} {featuredPayment.periodYear} Rent
          </p>
          <p className="text-3xl font-bold text-slate-dark mb-3">{formatCurrency(featuredPayment.totalAmount)}</p>
          <div className="space-y-3">
            <p className={`text-sm ${new Date(featuredPayment.dueDate) < now ? "text-red-600 font-medium" : "text-gray-500"}`}>
              {new Date(featuredPayment.dueDate) < now ? "Overdue — was due" : "Due"} {formatDate(featuredPayment.dueDate)}
            </p>
            {featuredPayment.lateFee > 0 && (
              <p className="text-xs text-red-600">Includes {formatCurrency(featuredPayment.lateFee)} late fee</p>
            )}
            {landlord?.stripeConnectReady ? (
              featuredPayment.stripePaymentUrl ? (
                <a href={featuredPayment.stripePaymentUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" size="lg">Pay Now</Button>
                </a>
              ) : (
                <PayRentButton rentPaymentId={featuredPayment.id} />
              )
            ) : (
              <p className="text-sm text-gray-500">Contact your landlord to arrange payment.</p>
            )}
          </div>
        </div>
      ) : lastPaid ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {monthName(lastPaid.periodMonth)} {lastPaid.periodYear} Rent
          </p>
          <p className="text-3xl font-bold text-slate-dark mb-3">{formatCurrency(lastPaid.totalAmount)}</p>
          <Badge variant="green" className="text-sm px-3 py-1">
            Paid {lastPaid.paidAt ? formatDate(lastPaid.paidAt) : ""}
          </Badge>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Rent</p>
          <p className="text-sm text-gray-500 mt-2">No rent charges yet. Check back soon.</p>
        </div>
      )}

      {/* Other overdue charges */}
      {otherOverdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-red-900 text-sm">Also Past Due</h2>
          {otherOverdue.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-red-900">{monthName(p.periodMonth)} {p.periodYear}</p>
                <p className="text-xs text-red-600">{formatCurrency(p.totalAmount)}{p.lateFee > 0 ? ` (incl. ${formatCurrency(p.lateFee)} late fee)` : ""}</p>
              </div>
              {landlord?.stripeConnectReady && (
                <div className="shrink-0 w-28">
                  <PayRentButton rentPaymentId={p.id} label="Pay" />
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-red-200 pt-3 flex justify-between">
            <span className="text-sm font-semibold text-red-900">Total overdue</span>
            <span className="font-bold text-red-900">{formatCurrency(otherOverdue.reduce((s, p) => s + p.totalAmount, 0))}</span>
          </div>
        </div>
      )}

      {/* Upcoming charges beyond the featured one */}
      {otherUpcoming.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-2">
          <h2 className="font-semibold text-gray-900 text-sm">Upcoming</h2>
          {otherUpcoming.map((p) => (
            <div key={p.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{monthName(p.periodMonth)} {p.periodYear}</span>
              <span className="text-gray-500">Due {formatDate(p.dueDate)} · {formatCurrency(p.totalAmount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Security deposit */}
      {lease.securityDeposit > 0 && (
        <div className={`rounded-xl p-5 ${lease.securityDepositPaid ? "bg-green-50 border border-green-200" : "bg-white border border-gray-100"}`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Security Deposit</p>
          <p className="text-2xl font-bold text-slate-dark mb-3">{formatCurrency(lease.securityDeposit)}</p>
          {deposit_paid && (
            <div className="mb-3">
              <Badge variant="green" className="text-sm px-3 py-1">Payment received — thank you!</Badge>
            </div>
          )}
          {lease.securityDepositPaid ? (
            <Badge variant="green" className="text-sm px-3 py-1">
              Received {lease.securityDepositPaidAt ? formatDate(lease.securityDepositPaidAt) : ""}
            </Badge>
          ) : landlord?.stripeConnectReady ? (
            <PayDepositButton />
          ) : (
            <p className="text-sm text-gray-500">Contact your landlord to arrange payment.</p>
          )}
        </div>
      )}

      {/* Lease info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Your Lease</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Started</span>
            <span>{formatDate(lease.startDate)}</span>
          </div>
          {lease.endDate ? (
            <div className="flex justify-between">
              <span className="text-gray-500">Ends</span>
              <span>{formatDate(lease.endDate)}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span>Month-to-month</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Rent due</span>
            <span>{ordinal(lease.rentDueDay)} of each month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Monthly rent</span>
            <span className="font-medium">{formatCurrency(lease.monthlyRent)}</span>
          </div>
          {lease.securityDeposit > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Security deposit</span>
              <span>{formatCurrency(lease.securityDeposit)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Utilities */}
      {lease.unit.utilitiesIncluded.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Utilities Included</h2>
          <div className="flex flex-wrap gap-1.5">
            {lease.unit.utilitiesIncluded.map((u) => (
              <span key={u} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">{u}</span>
            ))}
          </div>
          {lease.unit.utilitiesNote && (
            <p className="text-xs text-gray-500 mt-2">{lease.unit.utilitiesNote}</p>
          )}
        </div>
      )}

      {/* Open maintenance requests */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm">Maintenance</h2>
          <Link href="/tenant-portal/maintenance/new">
            <Button size="sm" variant="secondary"><Plus size={13} className="mr-1" />New request</Button>
          </Link>
        </div>
        {openRequests.length === 0 ? (
          <p className="text-sm text-gray-400">No open requests.</p>
        ) : (
          <div className="space-y-2">
            {openRequests.map((req) => (
              <Link
                key={req.id}
                href="/tenant-portal/maintenance"
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:opacity-75 transition-opacity"
              >
                <div>
                  <p className="text-sm text-gray-800">{req.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{req.category} · {formatDate(req.submittedAt)}</p>
                </div>
                <Badge variant={req.status === "in_progress" || req.status === "scheduled" ? "blue" : "yellow"} className="capitalize shrink-0 ml-3">
                  {req.status.replace("_", " ")}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Contact landlord */}
      {landlord && (landlord.showEmailToTenants || landlord.showPhoneToTenants) && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Contact Landlord</h2>
          <p className="text-sm text-gray-500 mb-3">{landlord.name}</p>
          <div className="flex flex-col gap-2">
            {landlord.showPhoneToTenants && landlord.phone && (
              <a href={`tel:${landlord.phone}`} className="flex items-center gap-2 text-sm font-medium text-slate-dark hover:text-primary transition">
                <Phone size={15} className="text-gray-400" />
                {landlord.phone}
              </a>
            )}
            {landlord.showEmailToTenants && landlord.email && (
              <a href={`mailto:${landlord.email}`} className="flex items-center gap-2 text-sm font-medium text-slate-dark hover:text-primary transition">
                <Mail size={15} className="text-gray-400" />
                {landlord.email}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
