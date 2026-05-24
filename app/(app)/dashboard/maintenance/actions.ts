"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { z } from "zod";

const MxSchema = z.object({
  unitId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().default("other"),
  priority: z.string().default("normal"),
});

export async function createMaintenanceRequest(data: z.infer<typeof MxSchema>) {
  const user = await requireServerUser();
  const parsed = MxSchema.parse(data);

  const unit = await prisma.unit.findFirst({ where: { id: parsed.unitId, property: { landlordId: user.id } } });
  if (!unit) throw new Error("Not found");

  const activeLease = await prisma.lease.findFirst({ where: { unitId: parsed.unitId, status: "active" } });

  const req = await prisma.maintenanceRequest.create({
    data: {
      ...parsed,
      landlordId: user.id,
      leaseId: activeLease?.id,
      photoUrls: [],
      resolvedPhotoUrls: [],
    },
  });

  if (parsed.priority === "emergency") {
    const { resend, FROM, APP_URL } = await import("@/lib/resend");
    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `EMERGENCY maintenance request — ${parsed.title}`,
      html: `<p>An emergency maintenance request has been submitted for Unit ${unit.unitNumber}:</p><p><strong>${parsed.title}</strong></p><p>${parsed.description}</p><p><a href="${APP_URL}/dashboard/maintenance/${req.id}">View Request</a></p>`,
    });
  }

  revalidatePath("/dashboard/maintenance");
  return req;
}

export async function updateMaintenanceStatus(id: string, status: string, notes?: string) {
  const user = await requireServerUser();

  const req = await prisma.maintenanceRequest.findFirst({
    where: { id, landlordId: user.id },
    include: { tenant: true, unit: { include: { property: true } } },
  });
  if (!req) throw new Error("Not found");

  const updateData: Record<string, unknown> = { status };
  if (status === "in_progress" && !req.acknowledgedAt) updateData.acknowledgedAt = new Date();
  if (status === "resolved") {
    updateData.resolvedAt = new Date();
    if (notes) updateData.resolutionNotes = notes;
  }

  await prisma.maintenanceRequest.update({ where: { id }, data: updateData });

  if (req.tenant?.email && (notes || status)) {
    const { resend, FROM } = await import("@/lib/resend");
    const addr = `${req.unit.property.address}, Unit ${req.unit.unitNumber}`;
    await resend.emails.send({
      from: FROM,
      to: req.tenant.email,
      subject: `Maintenance update — ${req.title}`,
      html: `<p>Hi ${req.tenant.name},</p><p>Your maintenance request "<strong>${req.title}</strong>" at ${addr} has been updated.</p><p><strong>Status:</strong> ${status.replace("_", " ")}</p>${notes ? `<p>${notes}</p>` : ""}`,
    });
  }

  revalidatePath(`/dashboard/maintenance/${id}`);
}

export async function updateMaintenanceDetails(id: string, data: {
  vendorName?: string;
  vendorPhone?: string;
  scheduledFor?: string;
  estimatedCost?: number;
  actualCost?: number;
}) {
  const user = await requireServerUser();
  await prisma.maintenanceRequest.updateMany({
    where: { id, landlordId: user.id },
    data: {
      ...data,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
    },
  });
  revalidatePath(`/dashboard/maintenance/${id}`);
}
