"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { z } from "zod";

const VendorSchema = z.object({
  name: z.string().min(1),
  trade: z.string().default("general"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  notes: z.string().optional(),
});

export async function createVendor(data: z.infer<typeof VendorSchema>) {
  const user = await requireServerUser();
  const parsed = VendorSchema.parse(data);
  await prisma.vendor.create({
    data: { ...parsed, email: parsed.email || null, landlordId: user.id },
  });
  revalidatePath("/dashboard/maintenance/vendors");
}

export async function updateVendor(id: string, data: z.infer<typeof VendorSchema>) {
  const user = await requireServerUser();
  const parsed = VendorSchema.parse(data);
  await prisma.vendor.updateMany({
    where: { id, landlordId: user.id },
    data: { ...parsed, email: parsed.email || null },
  });
  revalidatePath("/dashboard/maintenance/vendors");
}

export async function deleteVendor(id: string) {
  const user = await requireServerUser();
  await prisma.vendor.updateMany({
    where: { id, landlordId: user.id },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/maintenance/vendors");
}

export async function assignVendor(requestId: string, vendorId: string | null) {
  const user = await requireServerUser();
  const vendor = vendorId
    ? await prisma.vendor.findFirst({ where: { id: vendorId, landlordId: user.id } })
    : null;
  if (vendorId && !vendor) throw new Error("Vendor not found");

  await prisma.maintenanceRequest.updateMany({
    where: { id: requestId, landlordId: user.id },
    data: {
      vendorId: vendorId || null,
      vendorName: vendor?.name || null,
      vendorPhone: vendor?.phone || null,
    },
  });
  revalidatePath(`/dashboard/maintenance/${requestId}`);
}
