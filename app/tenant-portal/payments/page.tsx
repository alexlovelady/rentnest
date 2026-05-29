import { requireTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, monthName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function TenantPaymentsPage() {
  const session = await requireTenantUser();

  const payments = await prisma.rentPayment.findMany({
    where: { leaseId: session.leaseId },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  });

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.totalAmount, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-dark">Payments</h1>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No payment history yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Total paid</span>
            <span className="font-semibold text-gray-900">{formatCurrency(totalPaid)}</span>
          </div>

          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{monthName(p.periodMonth)} {p.periodYear}</p>
                  {p.status === "paid" && p.paidAt ? (
                    <p className="text-xs text-gray-400">Paid {formatDate(p.paidAt)}</p>
                  ) : (
                    <p className="text-xs text-gray-400">Due {formatDate(p.dueDate)}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">{formatCurrency(p.totalAmount)}</p>
                  {p.lateFee > 0 && (
                    <p className="text-xs text-red-500">incl. {formatCurrency(p.lateFee)} late fee</p>
                  )}
                  <Badge variant={p.status === "paid" ? "green" : "yellow"} className="mt-1 capitalize">{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
