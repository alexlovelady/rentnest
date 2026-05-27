"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { z } from "zod";

const LeaseSchema = z.object({
  unitId: z.string(),
  tenantIds: z.array(z.string()),
  primaryTenantId: z.string(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  leaseType: z.enum(["fixed", "month_to_month"]),
  monthlyRent: z.coerce.number(),
  securityDeposit: z.coerce.number().default(0),
  securityDepositPaid: z.coerce.boolean().default(false),
  rentDueDay: z.coerce.number().min(1).max(28).default(1),
  lateFeeEnabled: z.coerce.boolean().default(false),
  lateFeeType: z.enum(["flat", "percent"]).default("flat"),
  lateFeeAmount: z.coerce.number().default(0),
  lateFeeGracePeriodDays: z.coerce.number().default(5),
  petsAllowed: z.coerce.boolean().default(false),
  petDeposit: z.coerce.number().default(0),
  petRent: z.coerce.number().default(0),
  notes: z.string().optional(),
});

export async function createLease(data: z.infer<typeof LeaseSchema>) {
  const user = await requireServerUser();
  const { tenantIds, primaryTenantId, startDate, endDate, ...rest } = LeaseSchema.parse(data);

  const lease = await prisma.lease.create({
    data: {
      ...rest,
      landlordId: user.id,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      tenants: {
        create: tenantIds.map((tid) => ({
          tenantId: tid,
          isPrimary: tid === primaryTenantId,
        })),
      },
    },
  });

  revalidatePath("/dashboard/leases");
  return lease;
}

export async function terminateLease(leaseId: string, reason: string) {
  const user = await requireServerUser();
  await prisma.lease.updateMany({
    where: { id: leaseId, landlordId: user.id },
    data: {
      status: "terminated",
      terminatedAt: new Date(),
      terminationReason: reason,
    },
  });
  revalidatePath("/dashboard/leases");
}

export async function requestSignature(leaseId: string) {
  const user = await requireServerUser();
  const lease = await prisma.lease.findFirst({
    where: { id: leaseId, landlordId: user.id },
    include: { tenants: { include: { tenant: true } }, unit: { include: { property: true } } },
  });
  if (!lease) throw new Error("Lease not found");

  const { randomBytes } = await import("crypto");
  const { APP_URL, resend, FROM } = await import("@/lib/resend");

  for (const lt of lease.tenants) {
    if (!lt.tenant.email) continue;

    const existing = await prisma.leaseSignature.findFirst({
      where: { leaseId, tenantId: lt.tenantId, status: "signed" },
    });
    if (existing) continue;

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    await prisma.leaseSignature.upsert({
      where: { token },
      create: { leaseId, tenantId: lt.tenantId, token, expiresAt },
      update: { token, expiresAt, status: "pending", signerName: null, signerIp: null, signedAt: null },
    });

    const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;
    const signingUrl = `${APP_URL}/sign/${token}`;
    await resend.emails.send({
      from: FROM,
      to: lt.tenant.email,
      subject: `Please sign your lease — ${addr}`,
      html: `<p>Hi ${lt.tenant.name},</p><p>Your landlord has requested your signature on the lease for <strong>${addr}</strong>.</p><p>Please review and sign your lease here:</p><p><a href="${signingUrl}" style="background:#C4622D;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Sign Lease →</a></p><p>This link expires in 30 days.</p>`,
    });
  }

  revalidatePath(`/dashboard/leases/${leaseId}`);
}

export async function sendLeasePortalInvites(leaseId: string) {
  const user = await requireServerUser();
  const lease = await prisma.lease.findFirst({
    where: { id: leaseId, landlordId: user.id },
    include: { tenants: { include: { tenant: true } } },
  });
  if (!lease) throw new Error("Not found");

  const { sendTenantPortalInvite } = await import("@/lib/tenant-auth");
  for (const lt of lease.tenants) {
    if (lt.tenant.email) {
      await sendTenantPortalInvite(lt.tenantId, leaseId, user.id);
    }
  }
}
