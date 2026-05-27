import { NextRequest, NextResponse } from "next/server";
import { getTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { resend, FROM, APP_URL } from "@/lib/resend";
import { emailBase, greeting, ep, emailBlockquote, btn } from "@/lib/email";

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
      html: emailBase(
        greeting(landlord.name) +
        ep(`<strong>${tenant?.name ?? "Your tenant"}</strong> sent you a message:`) +
        emailBlockquote(body.trim()) +
        btn("View & Reply in RentNest →", `${APP_URL}/dashboard/leases/${session.leaseId}`)
      ),
    });
  }

  return NextResponse.json({ ok: true });
}
