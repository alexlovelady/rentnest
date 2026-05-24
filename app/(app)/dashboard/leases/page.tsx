import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

function leaseStatusBadge(status: string, endDate?: Date | null) {
  if (status === "active") {
    if (endDate) {
      const days = Math.ceil((endDate.getTime() - Date.now()) / 86400000);
      if (days <= 60 && days > 0) return <Badge variant="yellow">Expiring in {days}d</Badge>;
    }
    return <Badge variant="green">Active</Badge>;
  }
  if (status === "terminated") return <Badge variant="red">Terminated</Badge>;
  if (status === "expired") return <Badge variant="gray">Expired</Badge>;
  return <Badge variant="blue">{status}</Badge>;
}

export default async function LeasesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const user = await requireServerUser();

  const leases = await prisma.lease.findMany({
    where: {
      landlordId: user.id,
      ...(status ? { status } : {}),
    },
    include: {
      unit: { include: { property: true } },
      tenants: { include: { tenant: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const filters = ["active", "terminated", "expired"];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A2332]">Leases</h1>
        <Link href="/dashboard/leases/new">
          <Button><Plus size={16} /> New Lease</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <Link href="/dashboard/leases">
          <Button variant={!status ? "primary" : "secondary"} size="sm">All</Button>
        </Link>
        {filters.map((f) => (
          <Link key={f} href={`/dashboard/leases?status=${f}`}>
            <Button variant={status === f ? "primary" : "secondary"} size="sm" className="capitalize">{f}</Button>
          </Link>
        ))}
      </div>

      {leases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No leases found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {leases.map((lease) => {
            const tenantNames = lease.tenants.map((lt) => lt.tenant.name).join(", ");
            return (
              <Link key={lease.id} href={`/dashboard/leases/${lease.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{tenantNames}</p>
                  <p className="text-sm text-gray-500">{lease.unit.property.address}, Unit {lease.unit.unitNumber}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(lease.startDate)} → {lease.endDate ? formatDate(lease.endDate) : "Month-to-month"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(lease.monthlyRent)}/mo</p>
                  <div className="mt-1">{leaseStatusBadge(lease.status, lease.endDate)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
