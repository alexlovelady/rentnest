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
      lease: {
        include: {
          unit: { include: { property: true } },
          documents: { where: { docType: "lease" }, orderBy: { uploadedAt: "desc" }, take: 1 },
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

  const signedAt = new Date();
  const addr = `${sig.lease.unit.property.address}, Unit ${sig.lease.unit.unitNumber}`;

  // Generate signed PDF if a lease document exists
  let signedDocumentUrl: string | null = null;
  const leaseDoc = sig.lease.documents[0];
  if (leaseDoc?.fileUrl) {
    try {
      const { appendSignaturePage } = await import("@/lib/sign-pdf");
      const { admin } = await import("@/lib/firebase-admin");

      const pdfRes = await fetch(leaseDoc.fileUrl);
      if (pdfRes.ok) {
        const originalBytes = new Uint8Array(await pdfRes.arrayBuffer());
        const signedBytes = await appendSignaturePage(originalBytes, {
          tenantName: sig.tenant.name,
          signerName: signerName.trim(),
          signerIp: ip,
          signedAt,
          address: addr,
          leaseId: sig.leaseId,
        });

        const bucket = admin().storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
        const filename = `signed-leases/${sig.lease.landlordId}/${sig.leaseId}_${sig.tenantId}_${Date.now()}.pdf`;
        const fileRef = bucket.file(filename);
        await fileRef.save(Buffer.from(signedBytes), { contentType: "application/pdf" });
        await fileRef.makePublic();
        signedDocumentUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      }
    } catch {
      // PDF generation is best-effort — signature is still recorded if it fails
    }
  }

  await prisma.leaseSignature.update({
    where: { token },
    data: { status: "signed", signerName: signerName.trim(), signerIp: ip, signedAt, signedDocumentUrl },
  });

  const landlord = await prisma.landlord.findUnique({ where: { id: sig.lease.landlordId } });

  if (landlord?.email && landlord.notifyOnSignature !== false) {
    const { resend, FROM, APP_URL } = await import("@/lib/resend");
    const { emailBase, greeting, ep, detailTable, alertBox, btn } = await import("@/lib/email");
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `Lease signed — ${sig.tenant.name}`,
      html: emailBase(
        alertBox(`${sig.tenant.name} has signed the lease.`, "success") +
        greeting(landlord.name) +
        detailTable([
          ["Tenant", sig.tenant.name],
          ["Property", addr],
          ["Signed as", signerName],
          ["Date signed", signedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
          ...(signedDocumentUrl ? [["Signed document", "Attached below"] as [string, string]] : []),
        ]) +
        (signedDocumentUrl ? btn("Download Signed Lease →", signedDocumentUrl) : ep("Note: no lease document was attached, so no signed PDF was generated.")) +
        btn("View Lease →", `${APP_URL}/dashboard/leases/${sig.leaseId}`)
      ),
    });
  }

  return NextResponse.json({ ok: true, signedDocumentUrl });
}
