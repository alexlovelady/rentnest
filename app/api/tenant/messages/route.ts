import { NextRequest, NextResponse } from "next/server";
import { getTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { resend, FROM, APP_URL } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const session = await getTenantUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  await prisma.leaseMessage.create({
    data: {
      leaseId: session.leaseId,
      landlordId: session.landlordId,
      tenantId: session.tenantId,
      senderRole: "tenant",
      body: body.trim(),
    },
  });

  const landlord = await prisma.landlord.findUnique({ where: { id: session.landlordId } });
  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });

  if (landlord?.email) {
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `New message from ${tenant?.name ?? "your tenant"}`,
      html: `<p>Hi ${landlord.name},</p><p><strong>${tenant?.name ?? "Your tenant"}</strong> sent you a message:</p><blockquote style="border-left:3px solid #C4622D;margin:0;padding:8px 16px;color:#374151;">${body.trim()}</blockquote><p><a href="${APP_URL}/dashboard/leases/${session.leaseId}">View in RentNest →</a></p>`,
    });
  }

  return NextResponse.json({ ok: true });
}
