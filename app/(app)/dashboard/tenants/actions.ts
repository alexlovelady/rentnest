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

export async function updateInsurance(tenantId: string, data: { insuranceProvider: string; insurancePolicyNumber: string; insuranceExpiresAt: string }) {
  const user = await requireServerUser();
  await prisma.tenant.updateMany({
    where: { id: tenantId, landlordId: user.id },
    data: {
      insuranceProvider: data.insuranceProvider || null,
      insurancePolicyNumber: data.insurancePolicyNumber || null,
      insuranceExpiresAt: data.insuranceExpiresAt ? new Date(data.insuranceExpiresAt) : null,
    },
  });
  revalidatePath(`/dashboard/tenants/${tenantId}`);
}

export async function sendBulkMessage({ subject, message }: { subject: string; message: string }) {
  const user = await requireServerUser();

  const activeTenants = await prisma.tenant.findMany({
    where: {
      landlordId: user.id,
      isActive: true,
      email: { not: null },
      leases: { some: { lease: { status: "active" } } },
    },
    select: { name: true, email: true },
  });

  if (activeTenants.length === 0) throw new Error("No tenants with email addresses found");

  const { resend, FROM } = await import("@/lib/resend");
  const messageHtml = message.replace(/\n/g, "<br/>");

  await Promise.all(
    activeTenants.map((t) =>
      resend.emails.send({
        from: FROM,
        to: t.email!,
        subject,
        html: `<p>Hi ${t.name},</p><p>${messageHtml}</p><p style="color:#999;font-size:12px;margin-top:24px;">This message was sent by your landlord via RentNest.</p>`,
      })
    )
  );

  return { sent: activeTenants.length };
}
