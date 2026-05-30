import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, monthName, daysUntil, currentPeriod } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, DollarSign, Building2, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeChart } from "./income-chart";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { dismissOnboarding } from "./actions";

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

  // Occupancy — must come before onboarding so allUnits is defined
  const allUnits = await prisma.unit.findMany({
    where: { property: { landlordId: user.id }, isActive: true },
    include: {
      property: { select: { address: true, nickname: true } },
      leases: { where: { status: "active" }, select: { id: true } },
    },
  });
  const occupiedCount = allUnits.filter((u) => u.leases.length > 0).length;
  const occupancyByProperty = Object.values(
    allUnits.reduce<Record<string, { label: string; total: number; occupied: number }>>((acc, u) => {
      const key = u.property.nickname;
      if (!acc[key]) acc[key] = { label: u.property.nickname, total: 0, occupied: 0 };
      acc[key].total++;
      if (u.leases.length > 0) acc[key].occupied++;
      return acc;
    }, {})
  );

  // Onboarding checklist — only shown until all steps complete
  const [propertyCount, tenantCount] = await Promise.all([
    prisma.property.count({ where: { landlordId: user.id } }),
    prisma.tenant.count({ where: { landlordId: user.id } }),
  ]);
  const activeLeaseCount = await prisma.lease.count({ where: { landlordId: user.id, status: "active" } });
  const onboardingDone =
    propertyCount > 0 && allUnits.length > 0 && tenantCount > 0 && activeLeaseCount > 0 && rentPayments.length > 0;
  const onboardingDismissed = user.onboardingDismissed;

  // Last 6 months income + expenses for chart
  const chartMonths = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    return { start: startOfMonth(d), end: endOfMonth(d), label: d.toLocaleString("en-US", { month: "short" }) };
  });
  const [chartIncome, chartExpenses] = await Promise.all([
    prisma.rentPayment.findMany({
      where: { landlordId: user.id, status: "paid", paidAt: { gte: chartMonths[0].start, lte: chartMonths[5].end } },
      select: { paidAt: true, totalAmount: true },
    }),
    prisma.expense.findMany({
      where: { landlordId: user.id, date: { gte: chartMonths[0].start, lte: chartMonths[5].end } },
      select: { date: true, amount: true },
    }),
  ]);
  const chartData = chartMonths.map(({ start, end, label }) => ({
    month: label,
    income: chartIncome.filter((p) => p.paidAt && p.paidAt >= start && p.paidAt <= end).reduce((s, p) => s + p.totalAmount, 0),
    expenses: chartExpenses.filter((e) => e.date >= start && e.date <= end).reduce((s, e) => s + e.amount, 0),
  }));

  // Trial notice
  const trialDaysLeft = user.trialEndsAt
    ? Math.max(0, Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / 86400000))
    : null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-dark">Good morning, {user.name.split(" ")[0]}</h1>
        <p className="text-sm text-gray-500">{monthName(month)} {year} overview</p>
      </div>

      {trialDaysLeft !== null && trialDaysLeft <= 7 && user.plan === "trial" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-yellow-800 text-sm font-medium">Trial expires in {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}.</p>
          <Link href="/dashboard/settings" className="text-sm text-primary font-medium hover:underline">Subscribe now →</Link>
        </div>
      )}

      {emergencies.length > 0 && (
        <div className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="font-medium">{emergencies.length} emergency maintenance request{emergencies.length > 1 ? "s" : ""} need immediate attention.</p>
          <Link href="/dashboard/maintenance?priority=emergency" className="ml-auto text-white underline text-sm">View →</Link>
        </div>
      )}

      {/* Onboarding checklist */}
      {!onboardingDismissed && !onboardingDone && (
        <Card className="mb-8 border-primary/20 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Get started with RentNest</CardTitle>
            <form action={dismissOnboarding}>
              <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 transition">
                Dismiss
              </button>
            </form>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { done: propertyCount > 0, label: "Add your first property", href: "/dashboard/properties" },
                { done: allUnits.length > 0, label: "Add a unit to your property", href: "/dashboard/properties" },
                { done: tenantCount > 0, label: "Add a tenant", href: "/dashboard/tenants" },
                { done: activeLeaseCount > 0, label: "Create a lease", href: "/dashboard/leases/new" },
                { done: rentPayments.length > 0, label: "Set up rent payments", href: "/dashboard/rent" },
              ].map((step) => (
                <Link
                  key={step.label}
                  href={step.done ? "#" : step.href}
                  className={`flex items-center gap-3 text-sm ${step.done ? "text-gray-400 pointer-events-none" : "text-gray-700 hover:text-primary"}`}
                >
                  {step.done
                    ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    : <Circle size={16} className="text-gray-300 shrink-0" />
                  }
                  <span className={step.done ? "line-through" : ""}>{step.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rent summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

      <IncomeChart data={chartData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

      {/* Occupancy */}
      {allUnits.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Building2 size={16} /> Occupancy</CardTitle>
            <span className="text-2xl font-bold text-slate-dark">
              {`${Math.round((occupiedCount / allUnits.length) * 100)}%`}
              <span className="text-sm font-normal text-gray-400 ml-1">occupied</span>
            </span>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4 text-sm mb-4">
              <span className="text-green-700 font-medium">{occupiedCount} occupied</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{allUnits.length - occupiedCount} vacant</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{allUnits.length} total</span>
            </div>
            {occupancyByProperty.length > 1 && (
              <div className="space-y-2">
                {occupancyByProperty.map((p) => (
                  <div key={p.label} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-40 truncate">{p.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.round((p.occupied / p.total) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{p.occupied}/{p.total} units</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
