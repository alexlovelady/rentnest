import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Wrench, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { NewMaintenanceModal } from "./new-maintenance-modal";

const priorityColor = {
  emergency: "red",
  high: "orange",
  normal: "yellow",
  low: "gray",
} as const;

const statusColor = {
  open: "yellow",
  in_progress: "blue",
  scheduled: "blue",
  resolved: "green",
  closed: "gray",
} as const;

export default async function MaintenancePage({ searchParams }: { searchParams: Promise<{ status?: string; priority?: string }> }) {
  const { status, priority } = await searchParams;
  const user = await requireServerUser();

  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      landlordId: user.id,
      ...(status ? { status } : { status: { not: "closed" } }),
      ...(priority ? { priority } : {}),
    },
    include: {
      unit: { include: { property: true } },
      tenant: { select: { name: true } },
    },
    orderBy: [{ priority: "asc" }, { submittedAt: "desc" }],
  });

  const emergencies = requests.filter((r) => r.priority === "emergency" && r.status !== "resolved");

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A2332]">Maintenance</h1>
        <NewMaintenanceModal />
      </div>

      {emergencies.length > 0 && (
        <div className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="font-medium">{emergencies.length} emergency request{emergencies.length > 1 ? "s" : ""} need immediate attention!</p>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        <Link href="/dashboard/maintenance"><Badge variant={!status ? "orange" : "gray"} className="cursor-pointer">All Open</Badge></Link>
        {["open", "in_progress", "scheduled", "resolved"].map((s) => (
          <Link key={s} href={`/dashboard/maintenance?status=${s}`}>
            <Badge variant={status === s ? "orange" : "gray"} className="cursor-pointer capitalize">{s.replace("_", " ")}</Badge>
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Wrench size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No maintenance requests</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {requests.map((req) => (
            <Link key={req.id} href={`/dashboard/maintenance/${req.id}`} className="flex items-start justify-between px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${req.priority === "emergency" ? "bg-red-500" : req.priority === "high" ? "bg-orange-400" : "bg-gray-300"}`} />
                <div>
                  <p className="font-medium text-gray-900">{req.title}</p>
                  <p className="text-sm text-gray-500">{req.unit.property.address}, Unit {req.unit.unitNumber}</p>
                  {req.tenant && <p className="text-xs text-gray-400">Submitted by {req.tenant.name}</p>}
                  <p className="text-xs text-gray-400">{formatDate(req.submittedAt)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={priorityColor[req.priority as keyof typeof priorityColor] || "gray"} className="capitalize">{req.priority}</Badge>
                <Badge variant={statusColor[req.status as keyof typeof statusColor] || "gray"} className="capitalize">{req.status.replace("_", " ")}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
