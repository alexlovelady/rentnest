import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InspectionList } from "./inspection-list";

export default async function InspectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireServerUser();

  const lease = await prisma.lease.findFirst({
    where: { id, landlordId: user.id },
    include: {
      unit: { include: { property: true } },
      tenants: { include: { tenant: true } },
      inspectionReports: {
        orderBy: { date: "desc" },
        include: { items: { orderBy: { room: "asc" } } },
      },
    },
  });

  if (!lease) notFound();

  const tenantNames = lease.tenants.map((lt) => lt.tenant.name).join(" & ");
  const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <Link href={`/dashboard/leases/${id}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> {tenantNames}
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1A2332]">Inspection Reports</h1>
        <p className="text-sm text-gray-500 mt-1">{addr}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <InspectionList leaseId={id} reports={lease.inspectionReports} />
      </div>
    </div>
  );
}
