import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, monthName } from "@/lib/utils";
import { SendInviteButton } from "./send-invite-button";
import { TerminateLeaseButton } from "./terminate-lease-button";
import { RequestSignatureButton } from "./request-signature-button";

export default async function LeaseDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const user = await requireServerUser();

  const lease = await prisma.lease.findFirst({
    where: { id, landlordId: user.id },
    include: {
      unit: { include: { property: true } },
      tenants: { include: { tenant: true } },
      rentPayments: { orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }] },
      documents: { orderBy: { uploadedAt: "desc" } },
      signatures: { include: { tenant: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!lease) notFound();

  const statusColor = lease.status === "active" ? "green" : lease.status === "terminated" ? "red" : "gray";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link href="/dashboard/leases" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> Leases
      </Link>

      {created && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-800 font-medium">Lease created successfully!</p>
          <p className="text-sm text-green-700 mt-1">Send your tenant(s) their portal link below so they can pay rent online and submit maintenance requests.</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1A2332]">
              {lease.tenants.map((lt) => lt.tenant.name).join(" & ")}
            </h1>
            <p className="text-sm text-gray-500">{lease.unit.property.address}, Unit {lease.unit.unitNumber}</p>
          </div>
          <Badge variant={statusColor as "green" | "red" | "gray"}>{lease.status}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div><p className="text-xs text-gray-500">Monthly rent</p><p className="font-semibold">{formatCurrency(lease.monthlyRent)}</p></div>
          <div><p className="text-xs text-gray-500">Start</p><p>{formatDate(lease.startDate)}</p></div>
          <div><p className="text-xs text-gray-500">End</p><p>{lease.endDate ? formatDate(lease.endDate) : "Month-to-month"}</p></div>
          <div><p className="text-xs text-gray-500">Security deposit</p><p>{formatCurrency(lease.securityDeposit)}</p></div>
          <div><p className="text-xs text-gray-500">Rent due day</p><p>Day {lease.rentDueDay}</p></div>
          <div><p className="text-xs text-gray-500">Late fee</p><p>{lease.lateFeeEnabled ? `${lease.lateFeeType === "flat" ? "$" : ""}${lease.lateFeeAmount}${lease.lateFeeType === "percent" ? "%" : ""}` : "None"}</p></div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold mb-3">Tenants</h3>
          <div className="space-y-2">
            {lease.tenants.map((lt) => (
              <div key={lt.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{lt.tenant.name} {lt.isPrimary && <span className="text-xs text-gray-400">(Primary)</span>}</p>
                  <p className="text-xs text-gray-500">{lt.tenant.email || "No email"} {lt.tenant.phone && `· ${lt.tenant.phone}`}</p>
                </div>
                {lt.tenant.email && lease.status === "active" && (
                  <SendInviteButton tenantId={lt.tenantId} leaseId={lease.id} />
                )}
              </div>
            ))}
          </div>
        </div>

        {lease.status === "active" && (
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
            {/* Signature status */}
            {lease.signatures.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">Lease signatures</p>
                <div className="space-y-1.5">
                  {lease.signatures.map((sig) => (
                    <div key={sig.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{sig.tenant.name}</span>
                      {sig.status === "signed" ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <Check size={11} /> Signed {sig.signedAt ? formatDate(sig.signedAt) : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600 font-medium">Awaiting signature</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <RequestSignatureButton
                leaseId={lease.id}
                allSigned={lease.tenants.length > 0 && lease.tenants.every((lt) =>
                  lease.signatures.some((s) => s.tenantId === lt.tenantId && s.status === "signed")
                )}
              />
              <TerminateLeaseButton leaseId={lease.id} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold mb-4">Rent Ledger</h2>
        {lease.rentPayments.length === 0 ? (
          <p className="text-sm text-gray-500">No rent charges yet. Generate rent charges from the Rent page.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left pb-2">Period</th>
                <th className="text-left pb-2">Due Date</th>
                <th className="text-right pb-2">Rent</th>
                <th className="text-right pb-2">Late Fee</th>
                <th className="text-right pb-2">Total</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-left pb-2">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lease.rentPayments.map((p) => (
                <tr key={p.id} className={p.status === "paid" ? "bg-green-50/40" : p.status === "pending" && new Date(p.dueDate) < new Date() ? "bg-red-50/40" : ""}>
                  <td className="py-2">{monthName(p.periodMonth)} {p.periodYear}</td>
                  <td className="py-2 text-gray-500">{formatDate(p.dueDate)}</td>
                  <td className="py-2 text-right">{formatCurrency(p.amount)}</td>
                  <td className="py-2 text-right">{p.lateFee > 0 ? formatCurrency(p.lateFee) : "—"}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(p.totalAmount)}</td>
                  <td className="py-2"><Badge variant={p.status === "paid" ? "green" : p.status === "pending" ? "yellow" : "red"}>{p.status}</Badge></td>
                  <td className="py-2 text-gray-500">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
