import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarClient, CalendarEvent } from "./calendar-client";

export default async function CalendarPage() {
  const user = await requireServerUser();
  const now = new Date();
  const threeMonthsOut = new Date(now.getFullYear(), now.getMonth() + 3, 1);

  const events: CalendarEvent[] = [];

  // Rent due dates (next 3 months)
  const rentPayments = await prisma.rentPayment.findMany({
    where: {
      landlordId: user.id,
      status: "pending",
      dueDate: { gte: now, lte: threeMonthsOut },
    },
    include: {
      tenant: { select: { name: true } },
      lease: { include: { unit: { include: { property: true } } } },
    },
  });
  for (const p of rentPayments) {
    events.push({
      id: `rent-${p.id}`,
      date: p.dueDate,
      title: `Rent due${p.tenant ? ` — ${p.tenant.name}` : ""}`,
      subtitle: `${p.lease.unit.property.address}, Unit ${p.lease.unit.unitNumber}`,
      type: "rent",
      href: "/dashboard/rent",
    });
  }

  // Lease expirations (next 3 months)
  const expiringLeases = await prisma.lease.findMany({
    where: {
      landlordId: user.id,
      status: "active",
      endDate: { not: null, gte: now, lte: threeMonthsOut },
    },
    include: {
      unit: { include: { property: true } },
      tenants: { include: { tenant: true } },
    },
  });
  for (const l of expiringLeases) {
    if (!l.endDate) continue;
    const tenantNames = l.tenants.map((lt) => lt.tenant.name).join(", ");
    events.push({
      id: `lease-${l.id}`,
      date: l.endDate,
      title: `Lease expires — ${tenantNames}`,
      subtitle: `${l.unit.property.address}, Unit ${l.unit.unitNumber}`,
      type: "lease",
      href: `/dashboard/leases/${l.id}`,
    });
  }

  // Scheduled maintenance
  const scheduled = await prisma.maintenanceRequest.findMany({
    where: {
      landlordId: user.id,
      scheduledFor: { not: null, gte: now, lte: threeMonthsOut },
    },
    include: { unit: { include: { property: true } } },
  });
  for (const r of scheduled) {
    if (!r.scheduledFor) continue;
    events.push({
      id: `maint-${r.id}`,
      date: r.scheduledFor,
      title: r.title,
      subtitle: `${r.unit.property.address}, Unit ${r.unit.unitNumber}`,
      type: "maintenance",
      href: `/dashboard/maintenance/${r.id}`,
    });
  }

  // Inspection reports (by created date as reference)
  const inspections = await prisma.inspectionReport.findMany({
    where: {
      lease: { landlordId: user.id },
      date: { gte: now, lte: threeMonthsOut },
    },
    include: {
      lease: { include: { unit: { include: { property: true } }, tenants: { include: { tenant: true } } } },
    },
  });
  for (const ins of inspections) {
    events.push({
      id: `ins-${ins.id}`,
      date: ins.date,
      title: `${ins.type === "move_in" ? "Move-in" : "Move-out"} inspection`,
      subtitle: `${ins.lease.unit.property.address}, Unit ${ins.lease.unit.unitNumber}`,
      type: "inspection",
      href: `/dashboard/leases/${ins.leaseId}/inspections`,
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-dark">Calendar</h1>
        <p className="text-sm text-gray-500">Rent due dates, lease expirations, and scheduled maintenance</p>
      </div>
      <CalendarClient events={events} />
    </div>
  );
}
