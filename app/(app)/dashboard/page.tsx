import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, monthName, daysUntil, currentPeriod } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, DollarSign, Wrench, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireServerUser();
  const { month, year } = currentPeriod();
  const now = new Date();

  // Rent summary for this month
  const rentPayments = await prisma.rentPayment.findMany({
    where: { landlordId: user.id, periodMonth: month, periodYear: year },
    include: {
      lease: { include: { unit: { include: { property: true } } } },
      tenant: { select: { name: true } },
    },
  });

  const paid = rentPayments.filter((p) => p.status === "paid");
  const overdue = rentPayments.filter((p) => p.status === "pending" && new Date(p.dueDate) < now);
  const outstanding = rentPayments.filter((p) => p.status === "pending" && new Date(p.dueDate) >= now);

  // Open maintenance
  const openMaintenance = await prisma.maintenanceRequest.findMany({
    where: { landlordId: user.id, status: { in: ["open", "in_progress", "scheduled"] } },
    include: { unit: { include: { property: true } } },
    orderBy: [{ priority: "asc" }, { submittedAt: "desc" }],
    take: 10,
  });
  const emergencies = openMaintenance.filter((r) => r.priority === "emergency");

  // Expiring leases (60 days)
  const expiringLeases = await prisma.lease.findMany({
    where: {
      landlordId: user.id,
      status: "active",
      endDate: { not: null, gte: now, lte: new Date(now.getTime() + 60 * 86400000) },
    },
    include: {
      unit: { include: { property: true } },
      tenants: { include: { tenant: true } },
    },
    orderBy: { endDate: "asc" },
  });

  // Upcoming rent due (7 days)
  const upcomingRent = rentPayments.filter((p) => {
    const due = new Date(p.dueDate);
    const diff = (due.getTime() - now.getTime()) / 86400000;
    return p.status === "pending" && diff >= 0 && diff <= 7;
  });

  // Trial notice
  const trialDaysLeft = user.trialEndsAt
    ? Math.max(0, Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / 86400000))
    : null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A2332]">Good morning, {user.name.split(" ")[0]}</h1>
        <p className="text-sm text-gray-500">{monthName(month)} {year} overview</p>
      </div>

      {trialDaysLeft !== null && trialDaysLeft <= 7 && user.plan === "trial" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-yellow-800 text-sm font-medium">Trial expires in {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}.</p>
          <Link href="/dashboard/settings" className="text-sm text-[#C4622D] font-medium hover:underline">Subscribe now →</Link>
        </div>
      )}

      {emergencies.length > 0 && (
        <div className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="font-medium">{emergencies.length} emergency maintenance request{emergencies.length > 1 ? "s" : ""} need immediate attention.</p>
          <Link href="/dashboard/maintenance?priority=emergency" className="ml-auto text-white underline text-sm">View →</Link>
        </div>
      )}

      {/* Rent summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/rent" className="bg-green-50 border border-green-200 rounded-xl p-5 hover:shadow-sm transition">
          <p className="text-sm text-green-700 font-medium flex items-center gap-1.5"><DollarSign size={14} /> Collected</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{formatCurrency(paid.reduce((s, p) => s + p.totalAmount, 0))}</p>
          <p className="text-xs text-green-600 mt-1">{paid.length} of {rentPayments.length} payments</p>
        </Link>
        <Link href="/dashboard/rent" className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 hover:shadow-sm transition">
          <p className="text-sm text-yellow-700 font-medium">Outstanding</p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{formatCurrency(outstanding.reduce((s, p) => s + p.totalAmount, 0))}</p>
          <p className="text-xs text-yellow-600 mt-1">{outstanding.length} pending</p>
        </Link>
        <Link href="/dashboard/rent" className="bg-red-50 border border-red-200 rounded-xl p-5 hover:shadow-sm transition">
          <p className="text-sm text-red-700 font-medium">Overdue</p>
          <p className="text-2xl font-bold text-red-800 mt-1">{formatCurrency(overdue.reduce((s, p) => s + p.totalAmount, 0))}</p>
          <p className="text-xs text-red-600 mt-1">{overdue.length} overdue</p>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Overdue rent list */}
        {overdue.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Overdue Rent</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {overdue.map((p) => (
                  <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{p.tenant?.name || "—"}</p>
                      <p className="text-xs text-gray-500">{p.lease.unit.property.address}, Unit {p.lease.unit.unitNumber}</p>
                      <p className="text-xs text-red-500">Due {formatDate(p.dueDate)}</p>
                    </div>
                    <p className="text-sm font-semibold text-red-700">{formatCurrency(p.totalAmount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Open maintenance */}
        {openMaintenance.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Maintenance</CardTitle>
              <div className="flex gap-2">
                <Badge variant="red">{openMaintenance.filter(r => r.priority === "emergency").length} Emergency</Badge>
                <Badge variant="yellow">{openMaintenance.length} Open</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {openMaintenance.slice(0, 5).map((req) => (
                  <Link key={req.id} href={`/dashboard/maintenance/${req.id}`} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">{req.title}</p>
                      <p className="text-xs text-gray-500">{req.unit.property.address}, Unit {req.unit.unitNumber}</p>
                    </div>
                    <Badge variant={req.priority === "emergency" ? "red" : req.priority === "high" ? "orange" : "yellow"} className="capitalize">{req.priority}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expiring leases */}
        {expiringLeases.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Expiring Leases</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {expiringLeases.map((l) => {
                  const days = daysUntil(l.endDate!);
                  return (
                    <Link key={l.id} href={`/dashboard/leases/${l.id}`} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium">{l.tenants.map(lt => lt.tenant.name).join(", ")}</p>
                        <p className="text-xs text-gray-500">{l.unit.property.address}, Unit {l.unit.unitNumber}</p>
                      </div>
                      <Badge variant={days <= 30 ? "red" : "yellow"}>{days}d left</Badge>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming rent */}
        {upcomingRent.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Rent Due Soon (7 days)</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {upcomingRent.map((p) => (
                  <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{p.tenant?.name || "—"}</p>
                      <p className="text-xs text-gray-500">{p.lease.unit.property.address}, Unit {p.lease.unit.unitNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(p.totalAmount)}</p>
                      <p className="text-xs text-gray-400">Due {formatDate(p.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
