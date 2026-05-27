import { requireTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function TenantMaintenancePage() {
  const session = await requireTenantUser();

  const requests = await prisma.maintenanceRequest.findMany({
    where: { tenantId: session.tenantId, leaseId: session.leaseId },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-dark">Maintenance</h1>
        <Link href="/tenant-portal/maintenance/new">
          <Button size="sm"><Plus size={14} /> New Request</Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No maintenance requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{req.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{req.category} · {formatDate(req.submittedAt)}</p>
                </div>
                <Badge variant={req.status === "resolved" ? "green" : req.status === "in_progress" || req.status === "scheduled" ? "blue" : "yellow"} className="capitalize">
                  {req.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">{req.description}</p>
              {req.resolutionNotes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Resolution: {req.resolutionNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
