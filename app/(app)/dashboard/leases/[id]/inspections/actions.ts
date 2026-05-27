"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";

interface InspectionItemInput {
  room: string;
  condition: string;
  notes?: string;
}

export async function createInspection(
  leaseId: string,
  data: { type: string; date: string; notes?: string; items: InspectionItemInput[] }
) {
  const user = await requireServerUser();
  const lease = await prisma.lease.findFirst({ where: { id: leaseId, landlordId: user.id } });
  if (!lease) throw new Error("Not found");

  await prisma.inspectionReport.create({
    data: {
      leaseId,
      landlordId: user.id,
      type: data.type,
      date: new Date(data.date),
      notes: data.notes || null,
      items: { create: data.items.map((item) => ({ room: item.room, condition: item.condition, notes: item.notes || null })) },
    },
  });

  revalidatePath(`/dashboard/leases/${leaseId}/inspections`);
}

export async function deleteInspection(reportId: string, leaseId: string) {
  const user = await requireServerUser();
  await prisma.inspectionReport.deleteMany({ where: { id: reportId, landlordId: user.id } });
  revalidatePath(`/dashboard/leases/${leaseId}/inspections`);
}
