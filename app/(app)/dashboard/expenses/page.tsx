import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddExpenseModal } from "./add-expense-modal";
import { ExpenseFilters } from "./expense-filters";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ property?: string; category?: string; year?: string }> }) {
  const { property: propertyFilter, category: categoryFilter, year: yearFilter } = await searchParams;
  const user = await requireServerUser();

  const year = yearFilter ? parseInt(yearFilter) : new Date().getFullYear();

  const expenses = await prisma.expense.findMany({
    where: {
      landlordId: user.id,
      ...(propertyFilter ? { propertyId: propertyFilter } : {}),
      ...(categoryFilter ? { category: categoryFilter } : {}),
      date: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
    include: { property: { select: { nickname: true } } },
    orderBy: { date: "desc" },
  });

  const properties = await prisma.property.findMany({
    where: { landlordId: user.id, isActive: true },
    select: { id: true, nickname: true },
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">Expenses</h1>
          <p className="text-sm text-gray-500">Year: {year} · Total: {formatCurrency(total)}</p>
        </div>
        <AddExpenseModal properties={properties} />
      </div>

      <ExpenseFilters properties={properties} currentProperty={propertyFilter} currentCategory={categoryFilter} currentYear={year} />
      {expenses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No expenses for {year} yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500">
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Property</th>
                <th className="text-left px-4 py-3">Vendor</th>
                <th className="text-right px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="px-6 py-3 text-gray-500">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3 capitalize">{exp.category}</td>
                  <td className="px-4 py-3">{exp.description}</td>
                  <td className="px-4 py-3 text-gray-500">{exp.property?.nickname || "General"}</td>
                  <td className="px-4 py-3 text-gray-500">{exp.vendor || "—"}</td>
                  <td className="px-6 py-3 text-right font-medium">{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-100 bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-gray-700">Total</td>
                <td className="px-6 py-3 text-right font-bold">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
