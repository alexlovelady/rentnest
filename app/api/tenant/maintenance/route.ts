import { NextRequest, NextResponse } from "next/server";
import { getTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { resend, FROM, APP_URL } from "@/lib/resend";
import { emailBase, greeting, ep, detailTable, alertBox, btn } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getTenantUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, category, priority, photoUrls } = await req.json();

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
      photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
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
      html: emailBase(
        (priority === "emergency" ? alertBox("This is an emergency maintenance request requiring immediate attention.", "error") : "") +
        greeting(landlord.name) +
        ep(`<strong>${tenant?.name || "Your tenant"}</strong> submitted a maintenance request for <strong>${addr}</strong>.`) +
        detailTable([
          ["Issue", title],
          ["Priority", priority.charAt(0).toUpperCase() + priority.slice(1)],
          ["Category", (category || "other").charAt(0).toUpperCase() + (category || "other").slice(1)],
        ]) +
        ep(description) +
        btn("View Request →", `${APP_URL}/dashboard/maintenance/${request.id}`)
      ),
    });
  }

  return NextResponse.json({ ok: true, id: request.id });
}
