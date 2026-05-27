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
    const { emailBase, ep, detailTable, alertBox, btn } = await import("@/lib/email");
    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `EMERGENCY maintenance request — ${parsed.title}`,
      html: emailBase(
        alertBox("An emergency maintenance request was submitted and requires immediate attention.", "error") +
        detailTable([
          ["Issue", parsed.title],
          ["Unit", `Unit ${unit.unitNumber}`],
        ]) +
        ep(parsed.description) +
        btn("View Request →", `${APP_URL}/dashboard/maintenance/${req.id}`)
      ),
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
    const { emailBase, greeting, ep, detailTable } = await import("@/lib/email");
    const addr = `${req.unit.property.address}, Unit ${req.unit.unitNumber}`;
    const statusLabel = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    await resend.emails.send({
      from: FROM,
      to: req.tenant.email,
      subject: `Maintenance update — ${req.title}`,
      html: emailBase(
        greeting(req.tenant.name) +
        ep(`Your maintenance request for <strong>${addr}</strong> has been updated.`) +
        detailTable([
          ["Request", req.title],
          ["New status", statusLabel],
          ["Property", addr],
        ]) +
        (notes ? ep(notes) : "")
      ),
    });
  }

  revalidatePath(`/dashboard/maintenance/${id}`);
}

export async function addMaintenanceComment(
  requestId: string,
  body: string,
  attachmentUrl?: string,
  attachmentName?: string,
) {
  const user = await requireServerUser();
  const req = await prisma.maintenanceRequest.findFirst({ where: { id: requestId, landlordId: user.id } });
  if (!req) throw new Error("Not found");

  const comment = await prisma.maintenanceComment.create({
    data: {
      maintenanceRequestId: requestId,
      landlordId: user.id,
      body,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
    },
  });

  revalidatePath(`/dashboard/maintenance/${requestId}`);
  return comment;
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
