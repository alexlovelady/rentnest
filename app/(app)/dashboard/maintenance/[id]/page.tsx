import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { StatusWorkflowPanel } from "./status-workflow-panel";

const priorityColor = { emergency: "red", high: "orange", normal: "yellow", low: "gray" } as const;
const statusColor = { open: "yellow", in_progress: "blue", scheduled: "blue", resolved: "green", closed: "gray" } as const;

export default async function MaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireServerUser();

  const req = await prisma.maintenanceRequest.findFirst({
    where: { id, landlordId: user.id },
    include: {
      unit: { include: { property: true } },
      tenant: true,
    },
  });

  if (!req) notFound();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link href="/dashboard/maintenance" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> Maintenance
      </Link>

      {req.priority === "emergency" && req.status !== "resolved" && (
        <div className="bg-red-600 text-white rounded-xl p-4 mb-6 font-medium">
          Emergency — Respond immediately
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-xl font-bold text-[#1A2332]">{req.title}</h1>
              <div className="flex gap-2">
                <Badge variant={priorityColor[req.priority as keyof typeof priorityColor] || "gray"} className="capitalize">{req.priority}</Badge>
                <Badge variant={statusColor[req.status as keyof typeof statusColor] || "gray"} className="capitalize">{req.status.replace("_", " ")}</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{req.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Property</p><p>{req.unit.property.address}, Unit {req.unit.unitNumber}</p></div>
              <div><p className="text-xs text-gray-500">Category</p><p className="capitalize">{req.category}</p></div>
              <div><p className="text-xs text-gray-500">Submitted</p><p>{formatDate(req.submittedAt)}</p></div>
              {req.tenant && <div><p className="text-xs text-gray-500">Submitted by</p><p>{req.tenant.name}</p></div>}
            </div>
            {req.vendorName && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Vendor</p>
                <p className="text-sm font-medium">{req.vendorName}</p>
                {req.vendorPhone && <p className="text-sm text-gray-500">{req.vendorPhone}</p>}
                {req.scheduledFor && <p className="text-sm">Scheduled: {formatDate(req.scheduledFor)}</p>}
              </div>
            )}
            {(req.estimatedCost || req.actualCost) && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                {req.estimatedCost && <div><p className="text-xs text-gray-500">Estimated cost</p><p>${req.estimatedCost.toFixed(2)}</p></div>}
                {req.actualCost && <div><p className="text-xs text-gray-500">Actual cost</p><p>${req.actualCost.toFixed(2)}</p></div>}
              </div>
            )}
            {req.resolutionNotes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Resolution notes</p>
                <p className="text-sm">{req.resolutionNotes}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <StatusWorkflowPanel request={req} />
        </div>
      </div>
    </div>
  );
}
