import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { signerName } = await req.json();

  if (!signerName?.trim()) {
    return NextResponse.json({ error: "Signer name is required" }, { status: 400 });
  }

  const sig = await prisma.addendumSignature.findUnique({
    where: { token },
    include: {
      tenant: true,
      addendum: {
        include: {
          lease: { include: { unit: { include: { property: true } } } },
        },
      },
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

  await prisma.addendumSignature.update({
    where: { token },
    data: { status: "signed", signerName: signerName.trim(), signedAt: new Date() },
  });

  const { addendum } = sig;
  const addr = `${addendum.lease.unit.property.address}, Unit ${addendum.lease.unit.unitNumber}`;
  const landlord = await prisma.landlord.findUnique({ where: { id: addendum.landlordId } });

  if (landlord?.email) {
    const { resend, FROM, APP_URL } = await import("@/lib/resend");
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `Addendum signed — ${sig.tenant.name}`,
      html: `<p>Hi ${landlord.name},</p><p><strong>${sig.tenant.name}</strong> has signed <strong>${addendum.title}</strong> for <strong>${addr}</strong>.</p><p>Signed as: ${signerName}</p><p><a href="${APP_URL}/dashboard/leases/${addendum.leaseId}">View Lease →</a></p>`,
    });
  }

  return NextResponse.json({ ok: true });
}
