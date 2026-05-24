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
