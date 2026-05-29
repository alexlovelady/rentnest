import { requireTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, Wrench, Phone } from "lucide-react";

const statusVariant: Record<string, "green" | "blue" | "yellow" | "red" | "gray"> = {
  resolved: "green",
  in_progress: "blue",
  scheduled: "blue",
  open: "yellow",
  closed: "gray",
};

export default async function TenantMaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireTenantUser();

  const req = await prisma.maintenanceRequest.findFirst({
    where: { id, tenantId: session.tenantId, leaseId: session.leaseId },
  });

  if (!req) notFound();

  const statusLabel = req.status.replace(/_/g, " ");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-lg font-bold text-slate-dark">{req.title}</h1>
          <Badge variant={statusVariant[req.status] ?? "yellow"} className="capitalize shrink-0">
            {statusLabel}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
          <span className="capitalize">{req.category}</span>
          <span className="capitalize">Priority: {req.priority}</span>
          <span>Submitted {formatDate(req.submittedAt)}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{req.description}</p>
      </div>

      {/* Photos submitted with request */}
      {req.photoUrls.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Photos</p>
          <div className="flex flex-wrap gap-2">
            {req.photoUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt={`Photo ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-gray-100 hover:opacity-90 transition" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Status timeline */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Status</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <p className="text-sm text-gray-700">Request submitted — {formatDate(req.submittedAt)}</p>
          </div>
          {req.acknowledgedAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <p className="text-sm text-gray-700">Acknowledged by landlord — {formatDate(req.acknowledgedAt)}</p>
            </div>
          )}
          {req.scheduledFor && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <Calendar size={13} className="text-gray-400" />
                Work scheduled for {formatDate(req.scheduledFor)}
              </div>
            </div>
          )}
          {req.resolvedAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <p className="text-sm text-gray-700">Resolved — {formatDate(req.resolvedAt)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vendor info */}
      {req.vendorName && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Assigned Vendor</p>
          <div className="flex items-center gap-2">
            <Wrench size={14} className="text-gray-400 shrink-0" />
            <p className="text-sm font-medium text-gray-800">{req.vendorName}</p>
          </div>
          {req.vendorPhone && (
            <a href={`tel:${req.vendorPhone}`} className="flex items-center gap-2 mt-1.5 text-sm text-primary hover:underline">
              <Phone size={13} className="shrink-0" />
              {req.vendorPhone}
            </a>
          )}
        </div>
      )}

      {/* Resolution notes + photos */}
      {(req.resolutionNotes || req.resolvedPhotoUrls.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">Resolution</p>
          {req.resolutionNotes && (
            <p className="text-sm text-green-900 leading-relaxed mb-3">{req.resolutionNotes}</p>
          )}
          {req.resolvedPhotoUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {req.resolvedPhotoUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`Resolution photo ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-green-200 hover:opacity-90 transition" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
