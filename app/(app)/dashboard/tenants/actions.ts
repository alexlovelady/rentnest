"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { z } from "zod";

const TenantSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function createTenant(data: z.infer<typeof TenantSchema>) {
  const user = await requireServerUser();
  const parsed = TenantSchema.parse(data);
  const tenant = await prisma.tenant.create({
    data: {
      ...parsed,
      email: parsed.email || null,
      landlordId: user.id,
    },
  });
  revalidatePath("/dashboard/tenants");
  return tenant;
}

export async function updateTenant(id: string, data: z.infer<typeof TenantSchema>) {
  const user = await requireServerUser();
  const parsed = TenantSchema.parse(data);
  await prisma.tenant.updateMany({
    where: { id, landlordId: user.id },
    data: { ...parsed, email: parsed.email || null },
  });
  revalidatePath(`/dashboard/tenants/${id}`);
}

export async function sendPortalLink(tenantId: string, leaseId: string) {
  const user = await requireServerUser();
  const { sendTenantPortalInvite } = await import("@/lib/tenant-auth");
  await sendTenantPortalInvite(tenantId, leaseId, user.id);
}
