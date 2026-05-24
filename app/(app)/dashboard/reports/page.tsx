import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, monthName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DownloadCSVButton } from "./download-csv-button";

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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1A2332]">Reports</h1>
        <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" defaultValue={year} onChange={(e) => { window.location.href = `/dashboard/reports?year=${e.target.value}&report=${report}`; }}>
          {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="flex gap-2 mb-6">
        {[["rent-roll", "Rent Roll"], ["income", "Income & Expense"], ["vacancy", "Vacancy"]].map(([id, label]) => (
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
          <table className="w-full text-sm">
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
      )}

      {report === "income" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
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
    </div>
  );
}
