import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { signerName } = await req.json();

  if (!signerName?.trim()) {
    return NextResponse.json({ error: "Signer name is required" }, { status: 400 });
  }

  const sig = await prisma.leaseSignature.findUnique({
    where: { token },
    include: {
      tenant: true,
      lease: { include: { unit: { include: { property: true } } } },
    },
  });

  if (!sig) return NextResponse.json({ error: "Invalid signing link" }, { status: 404 });
  if (sig.status === "signed") return NextResponse.json({ error: "Already signed" }, { status: 409 });
  if (sig.expiresAt && sig.expiresAt < new Date()) {
    return NextResponse.json({ error: "This signing link has expired" }, { status: 410 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  await prisma.leaseSignature.update({
    where: { token },
    data: { status: "signed", signerName: signerName.trim(), signerIp: ip, signedAt: new Date() },
  });

  const addr = `${sig.lease.unit.property.address}, Unit ${sig.lease.unit.unitNumber}`;
  const landlord = await prisma.landlord.findUnique({ where: { id: sig.lease.landlordId } });

  if (landlord?.email) {
    const { resend, FROM, APP_URL } = await import("@/lib/resend");
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `Lease signed — ${sig.tenant.name}`,
      html: `<p>Hi ${landlord.name},</p><p><strong>${sig.tenant.name}</strong> has signed the lease for <strong>${addr}</strong>.</p><p>Signed as: ${signerName}</p><p><a href="${APP_URL}/dashboard/leases/${sig.leaseId}">View Lease</a></p>`,
    });
  }

  return NextResponse.json({ ok: true });
}
