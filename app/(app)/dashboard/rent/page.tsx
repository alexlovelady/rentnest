import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, monthName, currentPeriod } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GenerateRentButton } from "./generate-rent-button";
import { SendRemindersButton } from "./send-reminders-button";
import { RecordPaymentModal } from "./record-payment-modal";

export default async function RentPage() {
  const user = await requireServerUser();
  const { month, year } = currentPeriod();

  const payments = await prisma.rentPayment.findMany({
    where: { landlordId: user.id, periodMonth: month, periodYear: year },
    include: {
      lease: { include: { unit: { include: { property: true } } } },
      tenant: true,
    },
    orderBy: { dueDate: "asc" },
  });

  const paid = payments.filter((p) => p.status === "paid");
  const pending = payments.filter((p) => p.status === "pending" && new Date(p.dueDate) >= new Date());
  const overdue = payments.filter((p) => p.status === "pending" && new Date(p.dueDate) < new Date());

  const totalPaid = paid.reduce((s, p) => s + p.totalAmount, 0);
  const totalPending = [...pending, ...overdue].reduce((s, p) => s + p.totalAmount, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">Rent Collection</h1>
          <p className="text-sm text-gray-500">{monthName(month)} {year}</p>
        </div>
        <div className="flex gap-2">
          <SendRemindersButton />
          <RecordPaymentModal />
          <GenerateRentButton month={month} year={year} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-sm text-green-700 font-medium">Collected</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-green-600 mt-1">{paid.length} payment{paid.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="text-sm text-yellow-700 font-medium">Outstanding</p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-yellow-600 mt-1">{pending.length + overdue.length} payment{pending.length + overdue.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-sm text-red-700 font-medium">Overdue</p>
          <p className="text-2xl font-bold text-red-800 mt-1">{formatCurrency(overdue.reduce((s, p) => s + p.totalAmount, 0))}</p>
          <p className="text-xs text-red-600 mt-1">{overdue.length} payment{overdue.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-3">No rent charges for this month yet.</p>
          <GenerateRentButton month={month} year={year} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500">
                <th className="text-left px-6 py-3">Property / Unit</th>
                <th className="text-left px-4 py-3">Tenant</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Due</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => {
                const isOverdue = p.status === "pending" && new Date(p.dueDate) < new Date();
                return (
                  <tr key={p.id} className={isOverdue ? "bg-red-50/30" : ""}>
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/properties/${p.lease.unit.propertyId}`} className="text-[#C4622D] hover:underline">
                        {p.lease.unit.property.address}
                      </Link>
                      <p className="text-xs text-gray-400">Unit {p.lease.unit.unitNumber}</p>
                    </td>
                    <td className="px-4 py-3">{p.tenant?.name || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(p.dueDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === "paid" ? "green" : isOverdue ? "red" : "yellow"}>
                        {isOverdue ? "Overdue" : p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{p.status === "paid" ? p.paymentMethod : "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
