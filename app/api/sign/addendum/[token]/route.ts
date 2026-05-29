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
    data: { status: "signed", signerName: signerName.trim(), signerIp: ip, signedAt: new Date() },
  });

  const { addendum } = sig;
  const addr = `${addendum.lease.unit.property.address}, Unit ${addendum.lease.unit.unitNumber}`;
  const landlord = await prisma.landlord.findUnique({ where: { id: addendum.landlordId } });

  if (landlord?.email && landlord.notifyOnSignature !== false) {
    const { resend, FROM, APP_URL } = await import("@/lib/resend");
    const { emailBase, greeting, detailTable, alertBox, btn } = await import("@/lib/email");
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `Addendum signed — ${sig.tenant.name}`,
      html: emailBase(
        alertBox(`${sig.tenant.name} has signed "${addendum.title}".`, "success") +
        greeting(landlord.name) +
        detailTable([
          ["Tenant", sig.tenant.name],
          ["Addendum", addendum.title],
          ["Property", addr],
          ["Signed as", signerName],
          ["Date signed", new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
        ]) +
        btn("View Lease →", `${APP_URL}/dashboard/leases/${addendum.leaseId}`)
      ),
    });
  }

  return NextResponse.json({ ok: true });
}
