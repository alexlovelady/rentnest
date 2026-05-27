import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, monthName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DownloadCSVButton } from "./download-csv-button";
import { ReportYearSelect } from "./report-year-select";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ year?: string; report?: string }> }) {
  const { year: yearStr, report = "rent-roll" } = await searchParams;
  const user = await requireServerUser();
  const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

  // Rent roll
  const activeLeases = await prisma.lease.findMany({
    where: { landlordId: user.id, status: "active" },
    include: {
      unit: { include: { property: true } },
      tenants: { include: { tenant: true } },
    },
    orderBy: [{ unit: { property: { address: "asc" } } }],
  });

  // Income & expense
  const paidPayments = await prisma.rentPayment.findMany({
    where: {
      landlordId: user.id, status: "paid",
      paidAt: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
    },
    include: { lease: { include: { unit: { include: { property: true } } } } },
  });

  const expenses = await prisma.expense.findMany({
    where: {
      landlordId: user.id,
      date: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
    },
    include: { property: { select: { nickname: true } } },
  });

  // Maintenance costs
  const maintenanceCosts = await prisma.maintenanceRequest.findMany({
    where: { landlordId: user.id, actualCost: { gt: 0 } },
    include: { unit: { include: { property: { select: { address: true, nickname: true } } } } },
    orderBy: { submittedAt: "desc" },
  });
  const totalMaintenanceCost = maintenanceCosts.reduce((s, r) => s + (r.actualCost ?? 0), 0);
  const maintenanceByProperty = Object.values(
    maintenanceCosts.reduce<Record<string, { label: string; total: number; count: number }>>((acc, r) => {
      const key = r.unit.property.nickname;
      if (!acc[key]) acc[key] = { label: r.unit.property.nickname, total: 0, count: 0 };
      acc[key].total += r.actualCost ?? 0;
      acc[key].count++;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);
  const maintenanceByCategory = Object.entries(
    maintenanceCosts.reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + (r.actualCost ?? 0);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  // Vacancy
  const allUnits = await prisma.unit.findMany({
    where: { property: { landlordId: user.id }, isActive: true },
    include: {
      property: true,
      leases: { where: { status: "active" }, include: { tenants: { include: { tenant: true } } } },
    },
  });
  const vacantUnits = allUnits.filter((u) => u.leases.length === 0);

  const totalIncome = paidPayments.reduce((s, p) => s + p.totalAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const expensesByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const rentRollCsv = [
    ["Property", "Unit", "Tenant", "Monthly Rent", "Lease Start", "Lease End", "Status"],
    ...activeLeases.map((l) => [
      l.unit.property.address,
      l.unit.unitNumber,
      l.tenants.map((lt) => lt.tenant.name).join(", "),
      l.monthlyRent.toFixed(2),
      l.startDate.toISOString().split("T")[0],
      l.endDate ? l.endDate.toISOString().split("T")[0] : "Month-to-month",
      l.status,
    ]),
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1A2332]">Reports</h1>
        <ReportYearSelect currentYear={year} currentReport={report} />
      </div>

      <div className="flex gap-2 mb-6">
        {[["rent-roll", "Rent Roll"], ["income", "Income & Expense"], ["vacancy", "Vacancy"], ["maintenance", "Maintenance Costs"]].map(([id, label]) => (
          <a key={id} href={`/dashboard/reports?report=${id}&year=${year}`} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${report === id ? "bg-[#C4622D] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {label}
          </a>
        ))}
      </div>

      {report === "rent-roll" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Rent Roll — {new Date().toLocaleDateString()}</h2>
            <DownloadCSVButton data={rentRollCsv} filename="rent-roll.csv" />
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
              <tr>
                <th className="text-left px-6 py-3">Property</th>
                <th className="text-left px-4 py-3">Unit</th>
                <th className="text-left px-4 py-3">Tenant</th>
                <th className="text-right px-4 py-3">Monthly Rent</th>
                <th className="text-left px-4 py-3">Lease End</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeLeases.map((l) => (
                <tr key={l.id}>
                  <td className="px-6 py-3">{l.unit.property.address}</td>
                  <td className="px-4 py-3">Unit {l.unit.unitNumber}</td>
                  <td className="px-4 py-3">{l.tenants.map((lt) => lt.tenant.name).join(", ")}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(l.monthlyRent)}</td>
                  <td className="px-4 py-3 text-gray-500">{l.endDate ? formatDate(l.endDate) : "Month-to-month"}</td>
                  <td className="px-4 py-3"><Badge variant="green">Active</Badge></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-100 bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-3 font-semibold text-sm">Total</td>
                <td className="px-4 py-3 text-right font-bold">{formatCurrency(activeLeases.reduce((s, l) => s + l.monthlyRent, 0))}/mo</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
          </div>
        </div>
      )}

      {report === "income" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="text-sm text-green-700">Total Income</p>
              <p className="text-2xl font-bold text-green-800">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="text-sm text-red-700">Total Expenses</p>
              <p className="text-2xl font-bold text-red-800">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className={`${netIncome >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"} border rounded-xl p-5`}>
              <p className="text-sm text-gray-700">Net Income</p>
              <p className="text-2xl font-bold">{formatCurrency(netIncome)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-sm mb-4">Expenses by Category (Schedule E)</h3>
            <div className="space-y-2">
              {Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="capitalize text-gray-700">{cat}</span>
                  <span className="font-medium">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {report === "vacancy" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Vacant Units ({vacantUnits.length})</h2>
          </div>
          {vacantUnits.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-500">All units are occupied.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {vacantUnits.map((u) => (
                <div key={u.id} className="px-6 py-4">
                  <p className="font-medium">{u.property.address}</p>
                  <p className="text-sm text-gray-500">Unit {u.unitNumber} · {u.bedrooms}bd/{u.bathrooms}ba</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {report === "maintenance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <p className="text-sm text-orange-700">Total Spent</p>
              <p className="text-2xl font-bold text-orange-800">{formatCurrency(totalMaintenanceCost)}</p>
              <p className="text-xs text-orange-600 mt-1">{maintenanceCosts.length} completed job{maintenanceCosts.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-gray-500">Avg per job</p>
              <p className="text-2xl font-bold text-gray-800">
                {maintenanceCosts.length > 0 ? formatCurrency(totalMaintenanceCost / maintenanceCosts.length) : "—"}
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-gray-500">Properties with costs</p>
              <p className="text-2xl font-bold text-gray-800">{maintenanceByProperty.length}</p>
            </div>
          </div>

          {maintenanceByProperty.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-sm mb-4">Cost by Property</h3>
              <div className="space-y-2">
                {maintenanceByProperty.map((p) => (
                  <div key={p.label} className="flex justify-between text-sm">
                    <span className="text-gray-700">{p.label}</span>
                    <div className="text-right">
                      <span className="font-medium">{formatCurrency(p.total)}</span>
                      <span className="text-xs text-gray-400 ml-2">{p.count} job{p.count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {maintenanceByCategory.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-sm mb-4">Cost by Category</h3>
              <div className="space-y-2">
                {maintenanceByCategory.map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-700">{cat.replace(/_/g, " ")}</span>
                    <span className="font-medium">{formatCurrency(amt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {maintenanceCosts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-sm">All Jobs with Costs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                    <tr>
                      <th className="text-left px-6 py-3">Job</th>
                      <th className="text-left px-4 py-3">Property</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-left px-4 py-3">Vendor</th>
                      <th className="text-right px-4 py-3">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {maintenanceCosts.map((r) => (
                      <tr key={r.id}>
                        <td className="px-6 py-3 font-medium">{r.title}</td>
                        <td className="px-4 py-3 text-gray-500">{r.unit.property.nickname}, Unit {r.unit.unitNumber}</td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{r.category.replace(/_/g, " ")}</td>
                        <td className="px-4 py-3 text-gray-500">{r.vendorName || "—"}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(r.actualCost ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-gray-100 bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-6 py-3 font-semibold text-sm">Total</td>
                      <td className="px-4 py-3 text-right font-bold">{formatCurrency(totalMaintenanceCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {maintenanceCosts.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500 text-sm">No maintenance jobs with costs recorded yet. Add actual costs when closing out maintenance requests.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
