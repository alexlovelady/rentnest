import { NextRequest, NextResponse } from "next/server";
import { getTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { resend, FROM, APP_URL } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const session = await getTenantUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, category, priority } = await req.json();

  const lease = await prisma.lease.findUnique({
    where: { id: session.leaseId },
    include: { unit: { include: { property: true } } },
  });
  if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });

  const request = await prisma.maintenanceRequest.create({
    data: {
      unitId: lease.unitId,
      leaseId: session.leaseId,
      tenantId: session.tenantId,
      landlordId: session.landlordId,
      title,
      description,
      category: category || "other",
      priority: priority || "normal",
      photoUrls: [],
      resolvedPhotoUrls: [],
    },
  });

  const landlord = await prisma.landlord.findUnique({ where: { id: session.landlordId } });
  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });

  if (landlord?.notifyOnMaintenance && landlord.email) {
    const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `${priority === "emergency" ? "🚨 EMERGENCY: " : ""}New maintenance request — ${title}`,
      html: `<p>Hi ${landlord.name},</p><p><strong>${tenant?.name || "Your tenant"}</strong> submitted a maintenance request for ${addr}:</p><p><strong>${title}</strong> (${priority} priority)</p><p>${description}</p><p><a href="${APP_URL}/dashboard/maintenance/${request.id}">View Request</a></p>`,
    });
  }

  return NextResponse.json({ ok: true, id: request.id });
}
