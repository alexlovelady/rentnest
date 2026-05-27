import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SignClient } from "./sign-client";
import { formatDate } from "@/lib/utils";

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const sig = await prisma.leaseSignature.findUnique({
    where: { token },
    include: {
      tenant: true,
      lease: {
        include: {
          unit: { include: { property: true } },
          documents: { orderBy: { uploadedAt: "desc" }, take: 1 },
        },
      },
    },
  });

  if (!sig) notFound();

  if (sig.status === "signed") {
    return (
      <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center">
          <p className="text-2xl mb-3">✅</p>
          <h1 className="text-xl font-bold text-[#1A2332] mb-2">Already signed</h1>
          <p className="text-sm text-gray-500">This lease was signed on {sig.signedAt ? formatDate(sig.signedAt) : "—"}. No further action needed.</p>
        </div>
      </div>
    );
  }

  if (sig.expiresAt && sig.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center">
          <p className="text-2xl mb-3">⏰</p>
          <h1 className="text-xl font-bold text-[#1A2332] mb-2">Link expired</h1>
          <p className="text-sm text-gray-500">This signing link has expired. Contact your landlord to request a new one.</p>
        </div>
      </div>
    );
  }

  const lease = sig.lease;
  const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;
  const documentUrl = lease.documents[0]?.fileUrl ?? null;

  return (
    <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full">
        <div className="mb-6">
          <span className="font-bold text-lg text-[#1A2332]">RentNest</span>
        </div>
        <h1 className="text-xl font-bold text-[#1A2332] mb-1">Sign your lease</h1>
        <p className="text-sm text-gray-500 mb-6">Hi {sig.tenant.name}, please review and sign your lease below.</p>
        <SignClient
          token={token}
          tenantName={sig.tenant.name}
          address={addr}
          monthlyRent={lease.monthlyRent}
          startDate={formatDate(lease.startDate)}
          endDate={lease.endDate ? formatDate(lease.endDate) : null}
          documentUrl={documentUrl}
        />
      </div>
    </div>
  );
}
